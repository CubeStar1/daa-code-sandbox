import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
  Problem, 
  ProblemFilters, 
  ProblemSort, 
  ProblemsResponse, 
  ProblemDetailResponse, 
  SubmissionResponse,
  ProgrammingLanguage 
} from '@/lib/database-types'

// Query Keys
export const problemsKeys = {
  all: ['problems'] as const,
  lists: () => [...problemsKeys.all, 'list'] as const,
  list: (filters: ProblemFilters, sort: ProblemSort, page: number, limit: number, userId?: string) => 
    [...problemsKeys.lists(), { filters, sort, page, limit, userId }] as const,
  details: () => [...problemsKeys.all, 'detail'] as const,
  detail: (slug: string, userId?: string) => [...problemsKeys.details(), slug, userId] as const,
}

export const submissionKeys = {
  all: ['submissions'] as const,
}

// API Functions
async function fetchProblems({
  filters = {},
  sort = { field: 'created_at', direction: 'desc' },
  page = 1,
  limit = 20,
  userId
}: {
  filters?: ProblemFilters
  sort?: ProblemSort  
  page?: number
  limit?: number
  userId?: string
}): Promise<ProblemsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortField: sort.field,
    sortDirection: sort.direction,
  })

  if (filters.difficulty?.length) {
    params.append('difficulty', filters.difficulty.join(','))
  }
  if (filters.categories?.length) {
    params.append('categories', filters.categories.join(','))
  }
  if (filters.search) {
    params.append('search', filters.search)
  }
  if (userId) {
    params.append('userId', userId)
  }

  const response = await fetch(`/api/problems?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch problems')
  }
  return response.json()
}

async function fetchProblemBySlug({
  slug,
  userId
}: {
  slug: string
  userId?: string
}): Promise<ProblemDetailResponse> {
  const params = new URLSearchParams()
  if (userId) {
    params.append('userId', userId)
  }

  const response = await fetch(`/api/problems/${slug}?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch problem')
  }
  return response.json()
}

async function submitSolution({
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
}): Promise<SubmissionResponse> {
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId,
      userId,
      code,
      language,
      executionProvider
    })
  })

  if (!response.ok) {
    throw new Error('Failed to submit solution')
  }
  return response.json()
}

// React Query Hooks
export function useProblems({
  filters = {},
  sort = { field: 'created_at', direction: 'desc' },
  page = 1,
  limit = 20,
  userId
}: {
  filters?: ProblemFilters
  sort?: ProblemSort
  page?: number
  limit?: number
  userId?: string
} = {}) {
  return useQuery({
    queryKey: problemsKeys.list(filters, sort, page, limit, userId),
    queryFn: () => fetchProblems({ filters, sort, page, limit, userId }),
  })
}

export function useProblem({ slug, userId }: { slug: string; userId?: string }) {
  return useQuery({
    queryKey: problemsKeys.detail(slug, userId),
    queryFn: () => fetchProblemBySlug({ slug, userId }),
    enabled: !!slug,
  })
}

export function useSubmitSolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitSolution,
    onSuccess: (data, variables) => {
      // Invalidate and refetch problem details to update user stats
      queryClient.invalidateQueries({
        queryKey: problemsKeys.detail(variables.problemId, variables.userId)
      })
      
      // Invalidate problems list to update user stats there too
      queryClient.invalidateQueries({
        queryKey: problemsKeys.lists()
      })
    },
  })
}
