import { tool } from 'ai';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export const createProblem = tool({
  description: 'Create a new LeetCode-style problem in the database',
  inputSchema: z.object({
    title: z.string().describe('The problem title'),
    slug: z.string().describe('URL-friendly slug for the problem'),
    description: z.string().describe('Full problem description in markdown format'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('Problem difficulty level'),
    constraints: z.string().describe('Problem constraints as a formatted string'),
    hints: z.array(z.string()).describe('Array of progressive hints for the problem'),
    timeLimit: z.number().default(1000).describe('Time limit in milliseconds'),
    memoryLimit: z.number().default(256).describe('Memory limit in MB'),
  }),
  execute: async ({ title, slug, description, difficulty, constraints, hints, timeLimit, memoryLimit }) => {
    try {
      const supabase = await createSupabaseServer();
      
      const { data, error } = await supabase
        .from('problems')
        .insert({
          id: randomUUID(),
          title,
          slug,
          description,
          difficulty,
          constraints,
          hints,
          time_limit_ms: timeLimit,
          memory_limit_mb: memoryLimit,
          acceptance_rate: 0,
          total_submissions: 0,
          total_accepted: 0,
          is_published: true,
          is_premium: false,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating problem:', error);
        return {
          success: false,
          error: error.message,
          message: `Failed to create problem "${title}": ${error.message}`,
        };
      }

      return {
        success: true,
        problemId: data.id,
        message: `Problem "${title}" created successfully with ID: ${data.id}`,
        title,
        difficulty,
      };
    } catch (error) {
      console.error('Error creating problem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to create problem "${title}"`,
      };
    }
  },
});

export const addProblemCategories = tool({
  description: 'Add categories/tags to a problem',
  inputSchema: z.object({
    problemId: z.string().describe('The ID of the problem to add categories to'),
    categories: z.array(z.string()).describe('Array of category names (e.g., "array", "hash-table", "two-pointers")'),
  }),
  execute: async ({ problemId, categories }) => {
    try {
      const supabase = await createSupabaseServer();

      // First, get or create category IDs
      const categoryInserts = [];
      const categoryIds = [];

      for (const categoryName of categories) {
        // Check if category exists, if not create it
        let { data: existingCategory } = await supabase
          .from('problem_categories')
          .select('id')
          .eq('slug', categoryName.toLowerCase().replace(/\s+/g, '-'))
          .single();

        if (!existingCategory) {
          const { data: newCategory, error } = await supabase
            .from('problem_categories')
            .insert({
              id: randomUUID(),
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
              description: `Problems related to ${categoryName}`,
            })
            .select('id')
            .single();

          if (error) {
            console.error('Error creating category:', error);
            continue;
          }
          categoryIds.push(newCategory.id);
        } else {
          categoryIds.push(existingCategory.id);
        }
      }

      // Create problem-category relations
      const relations = categoryIds.map(categoryId => ({
        problem_id: problemId,
        category_id: categoryId,
      }));

      const { error: relationError } = await supabase
        .from('problem_category_relations')
        .insert(relations);

      if (relationError) {
        console.error('Error creating category relations:', relationError);
        return {
          success: false,
          error: relationError.message,
          message: `Failed to add categories to problem ${problemId}: ${relationError.message}`,
        };
      }

      return {
        success: true,
        message: `Added ${categories.length} categories to problem ${problemId}`,
        categories,
      };
    } catch (error) {
      console.error('Error adding categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to add categories to problem ${problemId}`,
      };
    }
  },
});

export const addTestCases = tool({
  description: 'Add test cases to a problem',
  inputSchema: z.object({
    problemId: z.string().describe('The ID of the problem to add test cases to'),
    testCases: z.array(z.object({
      input: z.string().describe('Test case input'),
      expectedOutput: z.string().describe('Expected output for the input'),
      isExample: z.boolean().describe('Whether this is an example test case shown to users'),
      explanation: z.string().optional().describe('Optional explanation for example test cases'),
    })).describe('Array of test cases'),
  }),
  execute: async ({ problemId, testCases }) => {
    try {
      const supabase = await createSupabaseServer();

      const testCaseInserts = testCases.map((testCase, index) => ({
        id: randomUUID(),
        problem_id: problemId,
        input: testCase.input,
        expected_output: testCase.expectedOutput,
        is_example: testCase.isExample,
        is_hidden: !testCase.isExample,
        order_index: index + 1,
      }));

      const { error } = await supabase
        .from('problem_test_cases')
        .insert(testCaseInserts);

      if (error) {
        console.error('Error creating test cases:', error);
        return {
          success: false,
          error: error.message,
          message: `Failed to add test cases to problem ${problemId}: ${error.message}`,
        };
      }

      return {
        success: true,
        message: `Added ${testCases.length} test cases to problem ${problemId}`,
        exampleCount: testCases.filter(tc => tc.isExample).length,
        hiddenCount: testCases.filter(tc => !tc.isExample).length,
      };
    } catch (error) {
      console.error('Error adding test cases:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to add test cases to problem ${problemId}`,
      };
    }
  },
});

export const addEditorial = tool({
  description: 'Add an editorial/solution to a problem with COMPLETE executable code including main functions',
  inputSchema: z.object({
    problemId: z.string().describe('The ID of the problem to add editorial to'),
    approachTitle: z.string().describe('Title of the solution approach'),
    approachDescription: z.string().describe('Brief description of the approach'),
    intuition: z.string().describe('Intuitive explanation of the solution'),
    algorithmSteps: z.string().describe('Step-by-step algorithm explanation'),
    complexityAnalysis: z.string().describe('Time and space complexity analysis'),
    codeSolutions: z.object({
      python: z.string().describe('Complete Python solution with main function, input reading, and output printing'),
      cpp: z.string().describe('Complete C++ solution with main function, input reading, and output printing'),
    }).describe('Complete executable code solutions that handle input/output, not just algorithm functions'),
  }),
  execute: async ({ problemId, approachTitle, approachDescription, intuition, algorithmSteps, complexityAnalysis, codeSolutions }) => {
    try {
      const supabase = await createSupabaseServer();

      const { error } = await supabase
        .from('problem_editorials')
        .insert({
          id: randomUUID(),
          problem_id: problemId,
          approach_title: approachTitle,
          approach_description: approachDescription,
          intuition,
          algorithm_steps: algorithmSteps,
          complexity_analysis: complexityAnalysis,
          code_solutions: codeSolutions,
          is_official: true,
          upvotes: 0,
          downvotes: 0,
        });

      if (error) {
        console.error('Error creating editorial:', error);
        return {
          success: false,
          error: error.message,
          message: `Failed to add editorial to problem ${problemId}: ${error.message}`,
        };
      }

      return {
        success: true,
        message: `Added editorial "${approachTitle}" to problem ${problemId}`,
        approachTitle,
        languages: Object.keys(codeSolutions),
      };
    } catch (error) {
      console.error('Error adding editorial:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to add editorial to problem ${problemId}`,
      };
    }
  },
});
