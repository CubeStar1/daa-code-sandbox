import { tool } from 'ai';
import { z } from 'zod';

// Tool to generate progressive hints for the user's current approach
export const generateHints = tool({
  description: 'Generate progressive hints to help the user solve a coding problem without giving away the solution. Analyze their current code and provide guidance.',
  inputSchema: z.object({
    problemTitle: z.string().describe('The title of the problem'),
    problemDescription: z.string().describe('The problem description'),
    userCode: z.string().describe('The code the user has written so far'),
    language: z.string().describe('The programming language being used'),
    userQuestion: z.string().optional().describe('Specific question the user is asking'),
  }),
  execute: async ({ problemTitle, problemDescription, userCode, language, userQuestion }) => {
    // This tool primarily structures the context for the AI to generate hints
    // The actual hint generation is done by the LLM using this structured input
    return {
      type: 'hint_request',
      context: {
        problem: problemTitle,
        description: problemDescription.slice(0, 500), // Truncate for token efficiency
        codeLength: userCode.length,
        language,
        hasCode: userCode.trim().length > 0,
        userQuestion: userQuestion || 'How can I approach this problem?',
      },
      instructions: `Provide 2-3 progressive hints that guide the user toward the solution without giving it away. 
        Hint 1 should be about the general approach.
        Hint 2 should hint at the data structure or algorithm.
        Hint 3 (if needed) can be more specific but still not reveal the full solution.
        Consider what the user has already written.`
    };
  },
});

// Tool to explain compilation or runtime errors
export const explainError = tool({
  description: 'Explain a compilation error, runtime error, or wrong answer to help the user understand what went wrong and how to fix it.',
  inputSchema: z.object({
    code: z.string().describe('The code that produced the error'),
    errorMessage: z.string().describe('The error message or wrong output'),
    language: z.string().describe('The programming language'),
    expectedOutput: z.string().optional().describe('Expected output if available'),
    actualOutput: z.string().optional().describe('Actual output if different from expected'),
  }),
  execute: async ({ code, errorMessage, language, expectedOutput, actualOutput }) => {
    // Analyze the error type
    const errorType = categorizeError(errorMessage);
    
    return {
      type: 'error_explanation',
      errorType,
      context: {
        language,
        codeSnippet: code.slice(0, 1000), // Truncate for efficiency
        errorMessage,
        expectedOutput: expectedOutput || null,
        actualOutput: actualOutput || null,
      },
      instructions: `Explain this ${errorType} error in simple terms:
        1. What the error means
        2. Common causes for this error
        3. How to identify the issue in their code
        4. A suggested fix (without rewriting their entire code)`
    };
  },
});

// Tool to suggest optimizations for the user's solution
export const suggestOptimization = tool({
  description: 'Analyze the user\'s working solution and suggest optimizations for better time or space complexity.',
  inputSchema: z.object({
    problemTitle: z.string().describe('The problem title'),
    problemDescription: z.string().describe('Brief problem description'),
    userCode: z.string().describe('The user\'s current solution'),
    language: z.string().describe('Programming language'),
    currentComplexity: z.string().optional().describe('User\'s estimate of current complexity'),
    testResults: z.string().optional().describe('Information about test results if available'),
  }),
  execute: async ({ problemTitle, problemDescription, userCode, language, currentComplexity, testResults }) => {
    return {
      type: 'optimization_suggestion',
      context: {
        problem: problemTitle,
        description: problemDescription.slice(0, 300),
        codeLength: userCode.length,
        language,
        userEstimate: currentComplexity || 'unknown',
        passedTests: testResults || 'unknown',
      },
      instructions: `Analyze this solution and suggest optimizations:
        1. Identify the current time and space complexity
        2. Point out any inefficiencies (nested loops, redundant operations, etc.)
        3. Suggest a more optimal approach if applicable
        4. Explain the trade-offs
        Be encouraging - acknowledge what they did well before suggesting improvements.`
    };
  },
});

// Helper function to categorize error types
function categorizeError(errorMessage: string): string {
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('compile') || lowerError.includes('syntax')) {
    return 'compilation';
  }
  if (lowerError.includes('runtime') || lowerError.includes('segmentation') || 
      lowerError.includes('null') || lowerError.includes('undefined')) {
    return 'runtime';
  }
  if (lowerError.includes('time limit') || lowerError.includes('tle')) {
    return 'time_limit_exceeded';
  }
  if (lowerError.includes('memory limit') || lowerError.includes('mle')) {
    return 'memory_limit_exceeded';
  }
  if (lowerError.includes('wrong') || lowerError.includes('expected')) {
    return 'wrong_answer';
  }
  
  return 'unknown';
}
