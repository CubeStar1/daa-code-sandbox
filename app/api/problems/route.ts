import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import type { ProblemFilters, ProblemSort } from '@/lib/database-types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const difficulty = searchParams.get('difficulty')?.split(',') || []
    const categories = searchParams.get('categories')?.split(',') || []
    const search = searchParams.get('search') || ''
    const sortField = searchParams.get('sortField') || 'created_at'
    const sortDirection = searchParams.get('sortDirection') || 'desc'
    const userId = searchParams.get('userId') || undefined

    const filters: ProblemFilters = {
      difficulty: difficulty.length > 0 ? difficulty as any[] : undefined,
      categories: categories.length > 0 ? categories : undefined,
      search: search || undefined
    }

    const sort: ProblemSort = {
      field: sortField as any,
      direction: sortDirection as 'asc' | 'desc'
    }

    // Build query
    let query = supabase
      .from('problems')
      .select(`
        *,
        problem_category_relations!inner(
          problem_categories(name)
        )
      `, { count: 'exact' })
      .eq('is_published', true)

    // Apply filters
    if (filters.difficulty?.length) {
      query = query.in('difficulty', filters.difficulty)
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    if (filters.categories?.length) {
      query = query.in('problem_category_relations.problem_categories.name', filters.categories)
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching problems:', error)
      return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 })
    }

    // If user is provided, get their progress for these problems
    let problemsWithStats = data || []
    if (userId && data?.length) {
      const problemIds = data.map(p => p.id)
      const { data: progressData } = await supabase
        .from('user_problem_progress')
        .select('*')
        .eq('user_id', userId)
        .in('problem_id', problemIds)

      problemsWithStats = data.map(problem => ({
        ...problem,
        user_stats: progressData?.find(p => p.problem_id === problem.id)
      }))
    }

    return NextResponse.json({
      problems: problemsWithStats,
      total: count || 0,
      page,
      limit
    })

  } catch (error) {
    console.error('Error in problems API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
