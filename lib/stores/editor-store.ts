import { create } from 'zustand'
import type { Problem, ProgrammingLanguage, UserProblemStats, UserSubmission, SubmissionStatus } from '@/lib/database-types'
import { executeCode, getStarterCode, type ExecutionResult } from '@/lib/execution-service'
import { ProblemService } from '@/lib/database-service'

interface TestCaseResult {
  test_case_index: number;
  input: string;
  expected_output: string;
  actual_output?: string;
  passed: boolean;
  runtime_ms?: number;
  memory_mb?: number;
}

interface EditorState {
  // Data state
  currentProblem: Problem | null
  problems: Problem[]
  selectedLanguage: ProgrammingLanguage
  code: string
  input: string
  output: string
  isRunning: boolean
  isSubmitting: boolean
  executionStats: { time?: string; memory?: string }
  executionProvider: 'judge0' | 'onecompiler'
  userStats: UserProblemStats | null
  lastSubmission: UserSubmission | null
  testResults: TestCaseResult[]
  submissionStatus: SubmissionStatus | null
  isLoading: boolean
  error: string | null
  
  // Basic actions
  setCurrentProblem: (problem: Problem) => void
  setProblems: (problems: Problem[]) => void
  setSelectedLanguage: (language: ProgrammingLanguage) => void
  setCode: (code: string) => void
  setInput: (input: string) => void
  setOutput: (output: string) => void
  setIsRunning: (isRunning: boolean) => void
  setIsSubmitting: (isSubmitting: boolean) => void
  setExecutionStats: (stats: { time?: string; memory?: string }) => void
  setExecutionProvider: (provider: 'judge0' | 'onecompiler') => void
  setUserStats: (stats: UserProblemStats | null) => void
  setLastSubmission: (submission: UserSubmission | null) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  
  // Complex actions
  changeProblem: (problem: Problem) => void
  changeLanguage: (language: ProgrammingLanguage) => void
  runCode: () => Promise<void>
  submitCode: (userId: string) => Promise<boolean>
  resetExecution: () => void
  
  // Navigation actions
  navigateToNext: () => Problem | null
  navigateToPrevious: () => Problem | null
  navigateToRandom: () => Problem | null
  navigateToProblem: (problemId: string) => Problem | null
  
  // Data loading actions
  loadProblemsData: () => Promise<void>
  loadProblemBySlug: (slug: string) => Promise<void>
  
  // Utility actions
  copyCode: () => Promise<boolean>
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  currentProblem: null,
  problems: [],
  selectedLanguage: 'cpp',
  code: '',
  input: '',
  output: '',
  isRunning: false,
  isSubmitting: false,
  executionStats: {},
  executionProvider: 'onecompiler',
  userStats: null,
  lastSubmission: null,
  testResults: [],
  submissionStatus: null,
  isLoading: false,
  error: null,

  // Basic setters
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  setProblems: (problems) => set({ problems }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  setCode: (code) => set({ code }),
  setInput: (input) => set({ input }),
  setOutput: (output) => set({ output }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setExecutionStats: (stats) => set({ executionStats: stats }),
  setExecutionProvider: (provider) => set({ executionProvider: provider }),
  setUserStats: (stats) => set({ userStats: stats }),
  setLastSubmission: (submission) => set({ lastSubmission: submission }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Data loading actions
  loadProblemsData: async () => {
    try {
      set({ isLoading: true, error: null })
      const problemsResponse = await ProblemService.getProblems()
      set({ problems: problemsResponse.problems, isLoading: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load problems'
      set({ error: errorMessage, isLoading: false })
      throw err
    }
  },

  loadProblemBySlug: async (slug: string) => {
    try {
      set({ isLoading: true, error: null })
      
      // Load the specific problem by slug
      const problemDetail = await ProblemService.getProblemBySlug(slug)
      
      // Attach editorial data to the problem object
      const problemWithEditorial = {
        ...problemDetail.problem,
        editorial: problemDetail.editorial,
        test_cases: problemDetail.test_cases,
        user_stats: problemDetail.user_stats
      }
      
      set({ currentProblem: problemWithEditorial })

      // Set default input from first example
      const firstExample = problemDetail.test_cases?.find(tc => tc.is_example)
      if (firstExample) {
        set({ input: firstExample.input })
      }

      set({ isLoading: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load problem'
      set({ error: errorMessage, isLoading: false })
      throw err
    }
  },

  // Navigation actions
  navigateToNext: () => {
    const { currentProblem, problems } = get()
    if (!currentProblem || problems.length === 0) return null
    
    const currentIndex = problems.findIndex(p => p.id === currentProblem.id)
    const nextIndex = (currentIndex + 1) % problems.length
    const nextProblem = problems[nextIndex]
    
    get().changeProblem(nextProblem)
    return nextProblem
  },

  navigateToPrevious: () => {
    const { currentProblem, problems } = get()
    if (!currentProblem || problems.length === 0) return null
    
    const currentIndex = problems.findIndex(p => p.id === currentProblem.id)
    const prevIndex = (currentIndex - 1 + problems.length) % problems.length
    const prevProblem = problems[prevIndex]
    
    get().changeProblem(prevProblem)
    return prevProblem
  },

  navigateToRandom: () => {
    const { currentProblem, problems } = get()
    if (!currentProblem || problems.length <= 1) return null
    
    const currentIndex = problems.findIndex(p => p.id === currentProblem.id)
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * problems.length)
    } while (randomIndex === currentIndex)
    
    const randomProblem = problems[randomIndex]
    get().changeProblem(randomProblem)
    return randomProblem
  },

  navigateToProblem: (problemId: string) => {
    const { problems } = get()
    const problem = problems.find(p => p.id === problemId)
    if (problem) {
      get().changeProblem(problem)
      return problem
    }
    return null
  },

  // Utility actions
  copyCode: async () => {
    try {
      const { code } = get()
      await navigator.clipboard.writeText(code)
      return true
    } catch (err) {
      console.error("Failed to copy code:", err)
      return false
    }
  },

  changeProblem: (problem) => {
    const { selectedLanguage } = get()
    
    // Get code for selected language from editorial or default template
    const defaultCode = getStarterCode(selectedLanguage)

    set({
      currentProblem: problem,
      code: defaultCode,
      input: getDefaultInput(problem),
      output: '',
      executionStats: {},
      userStats: problem.user_stats || null
    })
  },

  changeLanguage: (language) => {
    const starterCode = getStarterCode(language)
    set({ 
      selectedLanguage: language, 
      code: starterCode 
    })
  },

  runCode: async () => {
    const { code, input, executionProvider, selectedLanguage } = get()
    
    if (!code.trim()) {
      set({ output: 'Error: No code to execute' })
      return
    }
    
    set({ 
      isRunning: true, 
      output: 'Running...', 
      executionStats: {},
      testResults: [],
      submissionStatus: null
    })
    
    try {
      const result = await executeCode(code, input, selectedLanguage, executionProvider)
      
      set({
        output: result.output,
        executionStats: {
          time: result.time,
          memory: result.memory
        },
        isRunning: false,
        testResults: [],
        submissionStatus: null
      })
    } catch (error) {
      set({
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isRunning: false,
        executionStats: {}
      })
    }
  },

  submitCode: async (userId: string) => {
    const { code, currentProblem, selectedLanguage, executionProvider } = get()
    
    if (!code.trim()) {
      set({ output: 'Error: No code to submit' })
      return false
    }
    
    if (!currentProblem) {
      set({ output: 'Error: No problem selected' })
      return false
    }
    
    set({ 
      isSubmitting: true, 
      output: 'Submitting your solution...', 
      executionStats: {} 
    })
    
    try {
      const result = await ProblemService.submitSolution(
        currentProblem.id,
        userId,
        code,
        selectedLanguage,
        executionProvider
      )
      
      const submission = result.submission
      const testResults = result.test_results || []
      
      // Update store with submission results
      set({
        lastSubmission: submission,
        testResults: testResults,
        submissionStatus: submission.status,
        isSubmitting: false,
        executionStats: {
          time: submission.runtime_ms ? `${submission.runtime_ms} ms` : undefined,
          memory: submission.memory_usage_mb ? `${submission.memory_usage_mb} MB` : undefined
        }
      })
      
      // Format output based on submission status
      let outputMessage = ''
      if (submission.status === 'accepted') {
        outputMessage = `🎉 Accepted!\n\nPassed: ${submission.passed_test_cases}/${submission.total_test_cases} test cases\n`
        if (submission.runtime_ms) outputMessage += `Runtime: ${submission.runtime_ms}ms\n`
        if (submission.memory_usage_mb) outputMessage += `Memory: ${submission.memory_usage_mb}MB`
      } else {
        outputMessage = `❌ ${submission.status.replace('_', ' ').toUpperCase()}\n\nPassed: ${submission.passed_test_cases}/${submission.total_test_cases} test cases\n`
        
        if (submission.error_message) {
          outputMessage += `\nError: ${submission.error_message}`
        } else if (testResults.length > 0) {
          const failedTest = testResults.find(t => !t.passed)
          if (failedTest) {
            outputMessage += `\nFailed on test case ${failedTest.test_case_index + 1}:\n`
            outputMessage += `Input: ${failedTest.input}\n`
            outputMessage += `Expected: ${failedTest.expected_output}\n`
            outputMessage += `Got: ${failedTest.actual_output}`
          }
        }
      }
      
      set({ output: outputMessage })
      
      // Update user stats if problem was solved
      if (submission.status === 'accepted') {
        set({
          userStats: {
            ...get().userStats,
            is_solved: true,
            total_attempts: (get().userStats?.total_attempts || 0) + 1
          } as UserProblemStats
        })
      }
      
      return submission.status === 'accepted'
      
    } catch (error) {
      set({
        output: `Submission Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isSubmitting: false,
        executionStats: {}
      })
      return false
    }
  },

  resetExecution: () => set({
    output: '',
    executionStats: {},
    isRunning: false
  })
}))

// Helper function to get default input from test cases
function getDefaultInput(problem: Problem): string {
  // Get the first example's input as default
  const examples = problem.test_cases?.filter(tc => tc.is_example) || []
  return examples.length > 0 ? examples[0].input : ''
}
