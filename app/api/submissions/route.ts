import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import type { ProgrammingLanguage } from '@/lib/database-types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const body = await request.json()
    
    const {
      problemId,
      userId,
      code,
      language,
      executionProvider = 'onecompiler'
    }: {
      problemId: string
      userId: string
      code: string
      language: ProgrammingLanguage
      executionProvider?: 'judge0' | 'onecompiler'
    } = body

    if (!problemId || !userId || !code || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get all test cases for the problem (including hidden ones)
    const { data: testCases, error: testError } = await supabase
      .from('problem_test_cases')
      .select('*')
      .eq('problem_id', problemId)
      .order('order_index')

    if (testError) {
      console.error('Error fetching test cases:', testError)
      return NextResponse.json({ error: 'Failed to fetch test cases' }, { status: 500 })
    }

    if (!testCases || testCases.length === 0) {
      return NextResponse.json({ error: 'No test cases found for this problem' }, { status: 400 })
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
      .single()

    if (submitError) {
      console.error('Error creating submission:', submitError)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
    }

    let passedTests = 0
    let totalRuntime = 0
    let maxMemory = 0
    const testResults = []
    let submissionStatus: 'accepted' | 'wrong_answer' | 'runtime_error' | 'compile_error' | 'time_limit_exceeded' = 'accepted'
    let errorMessage = ''
    let failedTestIndex: number | undefined

    // Execute code against each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      
      try {
        // Get the base URL for the current request
        const baseUrl = new URL(request.url).origin
        
        const response = await fetch(`${baseUrl}/api/execute?provider=${executionProvider}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            input: testCase.input,
            language,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.error) {
          submissionStatus = 'runtime_error'
          errorMessage = result.error
          failedTestIndex = i
          break
        }

        const actualOutput = result.output.trim()
        const expectedOutput = testCase.expected_output.trim()
        const passed = actualOutput === expectedOutput

        if (passed) {
          passedTests++
        } else if (submissionStatus === 'accepted') {
          submissionStatus = 'wrong_answer'
          failedTestIndex = i
        }

        // Parse runtime and memory from result
        const runtime = parseFloat(result.time?.replace('s', '') || '0') * 1000 // Convert to ms
        const memory = parseFloat(result.memory?.replace(/[^\d.]/g, '') || '0') // Extract numbers

        totalRuntime += runtime
        maxMemory = Math.max(maxMemory, memory)

        testResults.push({
          test_case_index: i,
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: actualOutput,
          passed,
          runtime_ms: runtime,
          memory_mb: memory
        })

        // Stop execution on first failure (optional - you might want to continue)
        if (!passed && !testCase.is_example) {
          break
        }

      } catch (error) {
        submissionStatus = 'runtime_error'
        errorMessage = error instanceof Error ? error.message : 'Unknown error'
        failedTestIndex = i
        
        testResults.push({
          test_case_index: i,
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: errorMessage,
          passed: false,
          runtime_ms: 0,
          memory_mb: 0
        })
        break
      }
    }

    // Calculate average runtime
    const avgRuntime = testCases.length > 0 ? totalRuntime / testCases.length : 0

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
      .single()

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
    }

    // Update user progress
    await updateUserProgress(supabase, problemId, userId, submissionStatus === 'accepted')

    return NextResponse.json({
      submission: updatedSubmission,
      test_results: testResults
    })

  } catch (error) {
    console.error('Error in submission API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to update user progress
async function updateUserProgress(
  supabase: any,
  problemId: string,
  userId: string,
  isSolved: boolean
): Promise<void> {
  const { data: existing } = await supabase
    .from('user_problem_progress')
    .select('*')
    .eq('problem_id', problemId)
    .eq('user_id', userId)
    .single()

  const progressData = {
    user_id: userId,
    problem_id: problemId,
    is_solved: isSolved || (existing?.is_solved ?? false),
    is_attempted: true,
    total_attempts: (existing?.total_attempts ?? 0) + 1,
    first_solved_at: isSolved && !existing?.is_solved ? new Date().toISOString() : existing?.first_solved_at,
    last_attempted_at: new Date().toISOString()
  }

  if (existing) {
    await supabase
      .from('user_problem_progress')
      .update(progressData)
      .eq('id', existing.id)
  } else {
    await supabase
      .from('user_problem_progress')
      .insert(progressData)
  }
}
