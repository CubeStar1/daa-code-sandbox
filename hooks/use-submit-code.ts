import { useSubmitSolution } from './use-problems-api'
import { useEditorStore } from '@/lib/stores/editor-store'

export function useSubmitCode() {
  const submitMutation = useSubmitSolution()
  const { 
    setTestResults, 
    setSubmissionStatus, 
    setOutput, 
    setExecutionStats,
    code,
    selectedLanguage,
    executionProvider 
  } = useEditorStore()

  const submitCode = async (problemId: string, userId: string) => {
    if (!code.trim()) {
      setOutput('Error: No code to submit')
      return false
    }

    setOutput('Submitting your solution...')

    try {
      const result = await submitMutation.mutateAsync({
        problemId,
        userId,
        code,
        language: selectedLanguage,
        executionProvider
      })

      const submission = result.submission
      const testResults = result.test_results || []

      // Update store with submission results
      setTestResults(testResults)
      setSubmissionStatus(submission.status)
      setExecutionStats({
        time: submission.runtime_ms ? `${submission.runtime_ms} ms` : undefined,
        memory: submission.memory_usage_mb ? `${submission.memory_usage_mb} MB` : undefined
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

      setOutput(outputMessage)
      return submission.status === 'accepted'

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setOutput(`Submission Error: ${errorMessage}`)
      return false
    }
  }

  return {
    submitCode,
    isSubmitting: submitMutation.isPending,
    error: submitMutation.error
  }
}
