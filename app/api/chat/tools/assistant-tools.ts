import { tool } from 'ai';
import { z } from 'zod';

// Tool to generate progressive hints for the user's current approach
export const generateHints = tool({
  description: 'Generate progressive hints to help the user solve a coding problem without giving away the solution. Use this when the user asks for help or hints on how to approach a problem.',
  inputSchema: z.object({
    problemTitle: z.string().describe('The title of the problem'),
    userQuestion: z.string().describe('Specific question the user is asking'),
    hasWrittenCode: z.boolean().describe('Whether the user has written any code yet'),
    approachIdentified: z.string().describe('The approach the user seems to be taking based on their code, or "none" if not identified'),
  }),
  execute: async ({ problemTitle, userQuestion, hasWrittenCode, approachIdentified }) => {
    // Return structured data that the AI can use to formulate hints
    return JSON.stringify({
      action: 'provide_hints',
      problem: problemTitle,
      question: userQuestion,
      userHasCode: hasWrittenCode,
      identifiedApproach: approachIdentified,
      guidelines: [
        'Start with a high-level conceptual hint about the problem pattern',
        'If needed, hint at relevant data structures or algorithms',
        'Avoid giving direct code solutions',
        'Encourage the user to think through edge cases',
      ],
    });
  },
});

// Tool to explain compilation or runtime errors
export const explainError = tool({
  description: 'Explain a compilation error, runtime error, or wrong answer to help the user understand what went wrong and how to fix it.',
  inputSchema: z.object({
    errorType: z.enum(['compilation', 'runtime', 'wrong_answer', 'time_limit', 'memory_limit', 'unknown']).describe('The type of error'),
    errorMessage: z.string().describe('The error message or description'),
    language: z.string().describe('The programming language'),
    lineNumber: z.number().describe('Line number where error occurred if known, -1 if unknown'),
  }),
  execute: async ({ errorType, errorMessage, language, lineNumber }) => {
    const errorDescriptions: Record<string, string> = {
      compilation: 'A syntax or compilation error that prevents the code from running',
      runtime: 'An error that occurs while the code is executing',
      wrong_answer: 'The code runs but produces incorrect output',
      time_limit: 'The solution is too slow and exceeds the time limit',
      memory_limit: 'The solution uses too much memory',
      unknown: 'An unspecified error type',
    };

    return JSON.stringify({
      action: 'explain_error',
      errorCategory: errorType,
      categoryDescription: errorDescriptions[errorType],
      originalError: errorMessage,
      language,
      location: lineNumber > 0 ? `Line ${lineNumber}` : 'Unknown location',
      guidelines: [
        'Explain what this type of error means in simple terms',
        'Identify the likely cause based on the error message',
        'Suggest specific debugging steps',
        'Provide a fix hint without rewriting the entire solution',
      ],
    });
  },
});

// Tool to suggest optimizations for the user's solution
export const suggestOptimization = tool({
  description: "Analyze the user's working solution and suggest optimizations for better time or space complexity.",
  inputSchema: z.object({
    problemTitle: z.string().describe('The problem title'),
    currentTimeComplexity: z.string().describe('Estimated current time complexity (e.g., O(n^2)), or "unknown"'),
    currentSpaceComplexity: z.string().describe('Estimated current space complexity, or "unknown"'),
    solutionPasses: z.boolean().describe('Whether the current solution passes all tests'),
    bottleneck: z.string().describe('Identified bottleneck in the solution, or "none identified"'),
  }),
  execute: async ({ problemTitle, currentTimeComplexity, currentSpaceComplexity, solutionPasses, bottleneck }) => {
    return JSON.stringify({
      action: 'suggest_optimization',
      problem: problemTitle,
      analysis: {
        timeComplexity: currentTimeComplexity,
        spaceComplexity: currentSpaceComplexity,
        currentlyPassing: solutionPasses,
        identifiedBottleneck: bottleneck,
      },
      guidelines: [
        'First acknowledge what the user did well',
        'Analyze and state the current complexity',
        'Identify specific inefficiencies',
        'Suggest optimization strategies without full implementation',
        'Explain the complexity improvement',
      ],
    });
  },
});
