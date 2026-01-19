import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export interface UserStats {
  totalSolved: number
  totalAttempted: number
  solvedByDifficulty: { easy: number; medium: number; hard: number }
  currentStreak: number
  longestStreak: number
  acceptanceRate: number
  totalSubmissions: number
  activityData: { date: string; count: number }[]
  submissionHistory: { date: string; submissions: number; accepted: number }[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user progress data
    const { data: progressData, error: progressError } = await supabase
      .from('user_problem_progress')
      .select(`
        *,
        problems:problem_id (difficulty)
      `)
      .eq('user_id', userId)

    if (progressError) {
      console.error('Error fetching progress:', progressError)
      return NextResponse.json({ error: 'Failed to fetch user progress' }, { status: 500 })
    }

    // Get all submissions for activity data
    const { data: submissionsData, error: submissionsError } = await supabase
      .from('user_submissions')
      .select('submitted_at, status')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: true })

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    // Calculate basic stats
    const totalAttempted = progressData?.filter(p => p.is_attempted).length || 0
    const totalSolved = progressData?.filter(p => p.is_solved).length || 0

    // Calculate solved by difficulty
    const solvedByDifficulty = { easy: 0, medium: 0, hard: 0 }
    progressData?.forEach(p => {
      if (p.is_solved && p.problems?.difficulty) {
        const difficulty = p.problems.difficulty as 'easy' | 'medium' | 'hard'
        solvedByDifficulty[difficulty]++
      }
    })

    // Calculate streaks from solved dates
    const solvedDates = progressData
      ?.filter(p => p.is_solved && p.first_solved_at)
      .map(p => new Date(p.first_solved_at).toISOString().split('T')[0])
      .sort() || []

    const { currentStreak, longestStreak } = calculateStreaks(solvedDates)

    // Calculate acceptance rate
    const totalSubmissions = submissionsData?.length || 0
    const acceptedSubmissions = submissionsData?.filter(s => s.status === 'accepted').length || 0
    const acceptanceRate = totalSubmissions > 0 
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100 * 10) / 10 
      : 0

    // Build activity data (last 365 days)
    const activityData = buildActivityData(submissionsData || [])

    // Build submission history (monthly aggregation)
    const submissionHistory = buildSubmissionHistory(submissionsData || [])

    const stats: UserStats = {
      totalSolved,
      totalAttempted,
      solvedByDifficulty,
      currentStreak,
      longestStreak,
      acceptanceRate,
      totalSubmissions,
      activityData,
      submissionHistory
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error in user stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateStreaks(sortedDates: string[]): { currentStreak: number; longestStreak: number } {
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Remove duplicates
  const uniqueDates = [...new Set(sortedDates)]
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Check if most recent activity is today or yesterday for current streak
  const lastDate = uniqueDates[uniqueDates.length - 1]
  const isCurrentlyActive = lastDate === today || lastDate === yesterday

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1])
    const currDate = new Date(uniqueDates[i])
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000)

    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Calculate current streak
  if (isCurrentlyActive) {
    currentStreak = 1
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const currDate = new Date(uniqueDates[i + 1])
      const prevDate = new Date(uniqueDates[i])
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000)
      
      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}

function buildActivityData(submissions: { submitted_at: string; status: string }[]): { date: string; count: number }[] {
  const activityMap = new Map<string, number>()
  
  // Initialize last 365 days with 0
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    activityMap.set(dateStr, 0)
  }

  // Count submissions per day
  submissions.forEach(s => {
    const dateStr = new Date(s.submitted_at).toISOString().split('T')[0]
    if (activityMap.has(dateStr)) {
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1)
    }
  })

  return Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }))
}

function buildSubmissionHistory(submissions: { submitted_at: string; status: string }[]): { date: string; submissions: number; accepted: number }[] {
  const historyMap = new Map<string, { submissions: number; accepted: number }>()

  // Initialize last 12 months
  const today = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStr = date.toISOString().slice(0, 7) // YYYY-MM format
    historyMap.set(monthStr, { submissions: 0, accepted: 0 })
  }

  // Aggregate submissions by month
  submissions.forEach(s => {
    const monthStr = new Date(s.submitted_at).toISOString().slice(0, 7)
    if (historyMap.has(monthStr)) {
      const current = historyMap.get(monthStr)!
      current.submissions++
      if (s.status === 'accepted') {
        current.accepted++
      }
    }
  })

  return Array.from(historyMap.entries()).map(([date, data]) => ({
    date,
    submissions: data.submissions,
    accepted: data.accepted
  }))
}
