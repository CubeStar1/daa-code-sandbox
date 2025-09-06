// Database utility functions for the LeetCode clone
// Helper functions to interact with the new schema

import { createClient } from '@supabase/supabase-js';
import { executeCode } from './execution-service';
import type { 
  Problem, 
  TestCase, 
  Editorial, 
  UserSubmission, 
  ProblemFilters, 
  ProblemSort,
  ProblemsResponse,
  ProblemDetailResponse,
  SubmissionResponse,
  UserProblemStats,
  DifficultyLevel,
  ProgrammingLanguage
} from './database-types';

// Initialize Supabase client (you'll need to configure this)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Problem-related functions
export class ProblemService {
  
  // Get all problems with filtering and pagination
  static async getProblems(
    filters: ProblemFilters = {},
    sort: ProblemSort = { field: 'created_at', direction: 'desc' },
    page = 1,
    limit = 20,
    userId?: string
  ): Promise<ProblemsResponse> {
    let query = supabase
      .from('problems')
      .select(`
        *,
        problem_category_relations!inner(
          problem_categories(name)
        )
      `)
      .eq('is_published', true);

    // Apply filters
    if (filters.difficulty?.length) {
      query = query.in('difficulty', filters.difficulty);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters.categories?.length) {
      query = query.in('problem_category_relations.problem_categories.name', filters.categories);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // If user is provided, get their progress for these problems
    let problemsWithStats = data || [];
    if (userId && data?.length) {
      const problemIds = data.map(p => p.id);
      const { data: progressData } = await supabase
        .from('user_problem_progress')
        .select('*')
        .eq('user_id', userId)
        .in('problem_id', problemIds);

      problemsWithStats = data.map(problem => ({
        ...problem,
        user_stats: progressData?.find(p => p.problem_id === problem.id)
      }));
    }

    return {
      problems: problemsWithStats as Problem[],
      total: count || 0,
      page,
      limit
    };
  }

  // Get a single problem with all details
  static async getProblemBySlug(
    slug: string, 
    userId?: string
  ): Promise<ProblemDetailResponse> {
    // Get the main problem
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select(`
        *,
        problem_category_relations(
          problem_categories(name, slug)
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (problemError) throw problemError;

    // Get test cases (only examples for non-authenticated users)
    const { data: testCases } = await supabase
      .from('problem_test_cases')
      .select('*')
      .eq('problem_id', problem.id)
      .eq('is_example', true) // Only show examples in problem description
      .order('order_index');

    // Get editorial
    const { data: editorial } = await supabase
      .from('problem_editorials')
      .select('*')
      .eq('problem_id', problem.id)
      .eq('is_official', true)
      .single();

    // Get user stats if user is provided
    let userStats: UserProblemStats | undefined;
    if (userId) {
      const { data } = await supabase
        .rpc('get_user_problem_stats', {
          user_uuid: userId,
          problem_uuid: problem.id
        })
        .single();
      userStats = data as UserProblemStats;
    }

    // Get similar problems (same categories, different difficulty)
    const categories = problem.problem_category_relations?.map(
      (rel: any) => rel.problem_categories.name
    ) || [];
    
    let similarProblems: Partial<Problem>[] = [];
    if (categories.length > 0) {
      const { data: similar } = await supabase
        .from('problems')
        .select(`
          id, title, slug, difficulty, acceptance_rate
        `)
        .neq('id', problem.id)
        .eq('is_published', true)
        .limit(5);
      
      similarProblems = similar || [];
    }

    return {
      problem: problem as Problem,
      test_cases: testCases || [],
      editorial: editorial || undefined,
      user_stats: userStats,
      similar_problems: similarProblems as Problem[]
    };
  }

  // Submit a solution
  static async submitSolution(
    problemId: string,
    userId: string,
    code: string,
    language: ProgrammingLanguage,
    executionProvider: 'judge0' | 'onecompiler' = 'onecompiler'
  ): Promise<SubmissionResponse> {
    // Get all test cases for the problem (including hidden ones)
    const { data: testCases, error: testError } = await supabase
      .from('problem_test_cases')
      .select('*')
      .eq('problem_id', problemId)
      .order('order_index');

    if (testError) throw testError;
    if (!testCases || testCases.length === 0) {
      throw new Error('No test cases found for this problem');
    }

    // Create submission record
    const { data: submission, error: submitError } = await supabase
      .from('user_submissions')
      .insert({
        problem_id: problemId,
        user_id: userId,
        code,
        language,
        status: 'pending',
        total_test_cases: testCases.length,
        passed_test_cases: 0
      })
      .select()
      .single();

    if (submitError) throw submitError;

    let passedTests = 0;
    let totalRuntime = 0;
    let maxMemory = 0;
    const testResults = [];
    let submissionStatus: 'accepted' | 'wrong_answer' | 'runtime_error' | 'compile_error' | 'time_limit_exceeded' = 'accepted';
    let errorMessage = '';
    let failedTestIndex: number | undefined;

    // Execute code against each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        const result = await executeCode(
          code,
          testCase.input,
          language,
          executionProvider
        );

        const actualOutput = result.output.trim();
        const expectedOutput = testCase.expected_output.trim();
        const passed = actualOutput === expectedOutput;

        if (passed) {
          passedTests++;
        } else if (submissionStatus === 'accepted') {
          submissionStatus = 'wrong_answer';
          failedTestIndex = i;
        }

        // Parse runtime and memory from result
        const runtime = parseFloat(result.time?.replace('s', '') || '0') * 1000; // Convert to ms
        const memory = parseFloat(result.memory?.replace(/[^\d.]/g, '') || '0'); // Extract numbers

        totalRuntime += runtime;
        maxMemory = Math.max(maxMemory, memory);

        testResults.push({
          test_case_index: i,
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: actualOutput,
          passed,
          runtime_ms: runtime,
          memory_mb: memory
        });

        // Stop execution on first failure (optional - you might want to continue)
        if (!passed && !testCase.is_example) {
          break;
        }

      } catch (error) {
        submissionStatus = 'runtime_error';
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failedTestIndex = i;
        
        testResults.push({
          test_case_index: i,
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: errorMessage,
          passed: false,
          runtime_ms: 0,
          memory_mb: 0
        });
        break;
      }
    }

    // Calculate average runtime
    const avgRuntime = testCases.length > 0 ? totalRuntime / testCases.length : 0;

    // Update submission with results
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('user_submissions')
      .update({
        status: submissionStatus,
        runtime_ms: Math.round(avgRuntime),
        memory_usage_mb: Math.round(maxMemory),
        passed_test_cases: passedTests,
        failed_test_case_index: failedTestIndex,
        error_message: errorMessage || null,
        judged_at: new Date().toISOString()
      })
      .eq('id', submission.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update user progress
    if (submissionStatus === 'accepted') {
      await this.updateUserProgress(problemId, userId, true);
    } else {
      await this.updateUserProgress(problemId, userId, false);
    }

    return {
      submission: updatedSubmission as UserSubmission,
      test_results: testResults
    };
  }

  // Helper method to update user progress
  private static async updateUserProgress(
    problemId: string,
    userId: string,
    isSolved: boolean
  ): Promise<void> {
    const { data: existing } = await supabase
      .from('user_problem_progress')
      .select('*')
      .eq('problem_id', problemId)
      .eq('user_id', userId)
      .single();

    const progressData = {
      user_id: userId,
      problem_id: problemId,
      is_solved: isSolved || (existing?.is_solved ?? false),
      is_attempted: true,
      total_attempts: (existing?.total_attempts ?? 0) + 1,
      first_solved_at: isSolved && !existing?.is_solved ? new Date().toISOString() : existing?.first_solved_at,
      last_attempted_at: new Date().toISOString()
    };

    if (existing) {
      await supabase
        .from('user_problem_progress')
        .update(progressData)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_problem_progress')
        .insert(progressData);
    }
  }

  // Get all test cases for a problem (including hidden ones) - for submission evaluation
  static async getAllTestCases(problemId: string): Promise<TestCase[]> {
    const { data, error } = await supabase
      .from('problem_test_cases')
      .select('*')
      .eq('problem_id', problemId)
      .order('order_index');

    if (error) throw error;
    return data as TestCase[];
  }

  // Get user's submissions for a problem
  static async getUserSubmissions(
    problemId: string,
    userId: string,
    limit = 20
  ): Promise<UserSubmission[]> {
    const { data, error } = await supabase
      .from('user_submissions')
      .select('*')
      .eq('problem_id', problemId)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as UserSubmission[];
  }
}


export default {
  ProblemService
};
