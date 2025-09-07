import { create } from 'zustand'
import type { Problem, ProgrammingLanguage, SubmissionStatus } from '@/lib/database-types'
import { getStarterCode } from '@/lib/starter-code'

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
  // Current editing state
  selectedLanguage: ProgrammingLanguage
  code: string
  input: string
  output: string
  
  // Execution state
  isRunning: boolean
  executionStats: { time?: string; memory?: string }
  executionProvider: 'judge0' | 'onecompiler'
  
  // Submission results (from TanStack Query mutations)
  testResults: TestCaseResult[]
  submissionStatus: SubmissionStatus | null
  
  // Basic setters
  setSelectedLanguage: (language: ProgrammingLanguage) => void
  setCode: (code: string) => void
  setInput: (input: string) => void
  setOutput: (output: string) => void
  setIsRunning: (isRunning: boolean) => void
  setExecutionStats: (stats: { time?: string; memory?: string }) => void
  setExecutionProvider: (provider: 'judge0' | 'onecompiler') => void
  setTestResults: (results: TestCaseResult[]) => void
  setSubmissionStatus: (status: SubmissionStatus | null) => void
  
  // Actions
  changeLanguage: (language: ProgrammingLanguage) => void
  runCode: () => Promise<void>
  resetExecution: () => void
  resetForNewProblem: (problem?: Problem) => void
  
  // Utility actions
  copyCode: () => Promise<boolean>
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  selectedLanguage: 'cpp',
  code: '',
  input: '',
  output: '',
  isRunning: false,
  executionStats: {},
  executionProvider: 'onecompiler',
  testResults: [],
  submissionStatus: null,

  // Basic setters
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  setCode: (code) => set({ code }),
  setInput: (input) => set({ input }),
  setOutput: (output) => set({ output }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setExecutionStats: (stats) => set({ executionStats: stats }),
  setExecutionProvider: (provider) => set({ executionProvider: provider }),
  setTestResults: (results) => set({ testResults: results }),
  setSubmissionStatus: (status) => set({ submissionStatus: status }),

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

  resetForNewProblem: (problem) => {
    const { selectedLanguage } = get()
    
    // Get code for selected language from editorial or default template
    const defaultCode = getStarterCode(selectedLanguage)

    set({
      code: defaultCode,
      input: getDefaultInput(problem),
      output: '',
      executionStats: {},
      testResults: [],
      submissionStatus: null
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
      const response = await fetch(`/api/execute?provider=${executionProvider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          input,
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        set({
          output: result.error,
          isRunning: false,
          executionStats: {}
        })
      } else {
        set({
          output: result.output || 'No output',
          executionStats: {
            time: result.time,
            memory: result.memory
          },
          isRunning: false,
          testResults: [],
          submissionStatus: null
        })
      }
    } catch (error) {
      set({
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isRunning: false,
        executionStats: {}
      })
    }
  },

  resetExecution: () => set({
    output: '',
    executionStats: {},
    isRunning: false,
    testResults: [],
    submissionStatus: null
  })
}))

// Helper function to get default input from test cases
function getDefaultInput(problem?: Problem): string {
  if (!problem?.test_cases) return ''
  
  // Get the first example's input as default
  const examples = problem.test_cases.filter((tc: any) => tc.is_example) || []
  return examples.length > 0 ? examples[0].input : ''
}
