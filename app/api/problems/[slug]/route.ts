import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createSupabaseServer()
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined

    // Get the main problem
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select(`
        *,
        problem_category_relations(
          problem_categories(name, slug)
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (problemError) {
      console.error('Error fetching problem:', problemError)
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Get test cases (examples for display, all for the problem object)
    const { data: testCases } = await supabase
      .from('problem_test_cases')
      .select('*')
      .eq('problem_id', problem.id)
      .order('order_index')

    // Separate examples for display
    const exampleTestCases = testCases?.filter(tc => tc.is_example) || []

    // Get editorial (try official first, then any editorial)
    let editorial = null
    const { data: officialEditorial } = await supabase
      .from('problem_editorials')
      .select('*')
      .eq('problem_id', problem.id)
      .eq('is_official', true)
      .single()

    if (officialEditorial) {
      editorial = officialEditorial
    } else {
      // If no official editorial, get any editorial for this problem
      const { data: anyEditorial } = await supabase
        .from('problem_editorials')
        .select('*')
        .eq('problem_id', problem.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      editorial = anyEditorial
    }

    // Get user stats if user is provided
    let userStats = undefined
    if (userId) {
      const { data } = await supabase
        .rpc('get_user_problem_stats', {
          user_uuid: userId,
          problem_uuid: problem.id
        })
        .single()
      userStats = data
    }

    // Get similar problems (same categories, different difficulty)
    const categories = problem.problem_category_relations?.map(
      (rel: any) => rel.problem_categories.name
    ) || []
    
    let similarProblems: any[] = []
    if (categories.length > 0) {
      const { data: similar } = await supabase
        .from('problems')
        .select(`
          id, title, slug, difficulty, acceptance_rate
        `)
        .neq('id', problem.id)
        .eq('is_published', true)
        .limit(5)
      
      similarProblems = similar || []
    }

    // Attach editorial and test cases to the problem object for compatibility
    const problemWithDetails = {
      ...problem,
      editorial: editorial,
      test_cases: testCases || [],
      user_stats: userStats
    }

    return NextResponse.json({
      problem: problemWithDetails,
      test_cases: exampleTestCases,
      editorial: editorial,
      user_stats: userStats,
      similar_problems: similarProblems
    })

  } catch (error) {
    console.error('Error in problem detail API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
