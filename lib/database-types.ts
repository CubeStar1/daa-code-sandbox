// Updated types for LeetCode clone database schema
// This replaces the old Program interface with proper database models

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SubmissionStatus = 'pending' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compile_error';
export type ProgrammingLanguage = 'c' | 'cpp' | 'java' | 'python' | 'javascript' | 'typescript' | 'go' | 'rust' | 'c#';

// Core problem structure (matches database)
export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string; // Markdown content
  difficulty: DifficultyLevel;
  
  // Problem metadata
  constraints?: string;
  hints?: string[];
  
  // Statistics
  acceptance_rate: number;
  total_submissions: number;
  total_accepted: number;
  
  // Constraints
  time_limit_ms: number;
  memory_limit_mb: number;
  
  // Status
  is_published: boolean;
  is_premium: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Related data (joined from other tables)
  categories?: string[];
  test_cases?: TestCase[];
  editorial?: Editorial;
  user_stats?: UserProblemStats;
}

// Test cases for problems
export interface TestCase {
  id: string;
  problem_id: string;
  input: string;
  expected_output: string;
  is_example: boolean;
  is_hidden: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Editorial/Solution content
export interface Editorial {
  id: string;
  problem_id: string;
  approach_title: string;
  approach_description: string; // Markdown
  intuition?: string; // Markdown
  algorithm_steps?: string; // Markdown
  complexity_analysis?: string; // Markdown
  code_solutions: Record<ProgrammingLanguage, string>; // Code for different languages
  is_official: boolean;
  author_id?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
}

// User submission
export interface UserSubmission {
  id: string;
  problem_id: string;
  user_id: string;
  language: ProgrammingLanguage;
  code: string;
  status: SubmissionStatus;
  runtime_ms?: number;
  memory_usage_mb?: number;
  passed_test_cases: number;
  total_test_cases: number;
  failed_test_case_index?: number;
  error_message?: string;
  submitted_at: string;
  judged_at?: string;
  submission_count: number;
}

// User's progress on a specific problem
export interface UserProblemProgress {
  user_id: string;
  problem_id: string;
  is_solved: boolean;
  is_attempted: boolean;
  best_submission_id?: string;
  total_attempts: number;
  first_solved_at?: string;
  last_attempted_at: string;
}

// User stats for a problem (helper type)
export interface UserProblemStats {
  total_attempts: number;
  is_solved: boolean;
  best_runtime_ms?: number;
  best_memory_mb?: number;
  last_submission_status?: SubmissionStatus;
}

// Problem categories
export interface ProblemCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// Execution result (for code execution)
export interface ExecutionResult {
  output: string;
  time?: number;
  memory?: number;
  error?: string;
  isRateLimited?: boolean;
}

export interface ExecutionStats {
  time?: number;
  memory?: number;
}

// API response types
export interface ProblemsResponse {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
}

export interface ProblemDetailResponse {
  problem: Problem;
  test_cases: TestCase[];
  editorial?: Editorial;
  user_stats?: UserProblemStats;
  similar_problems?: Problem[];
}

export interface SubmissionResponse {
  submission: UserSubmission;
  test_results?: {
    test_case_index: number;
    input: string;
    expected_output: string;
    actual_output?: string;
    passed: boolean;
    runtime_ms?: number;
    memory_mb?: number;
  }[];
}

// Filter and sorting options
export interface ProblemFilters {
  difficulty?: DifficultyLevel[];
  categories?: string[];
  status?: 'solved' | 'attempted' | 'not_attempted';
  search?: string;
}

export interface ProblemSort {
  field: 'title' | 'difficulty' | 'acceptance_rate' | 'created_at';
  direction: 'asc' | 'desc';
}

// Legacy Program interface (for backwards compatibility during migration)
export interface LegacyProgram {
  id: string;
  name: string;
  description: string;
  category: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  algorithmSteps: string[];
  keyProperties: string[];
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
    analysis: string;
  };
  code: {
    c: string;
    cpp: string;
  };
  sampleInput?: string;
}
