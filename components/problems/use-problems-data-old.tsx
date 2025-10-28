import { useProblems } from "@/hooks/use-problems-api"
import useUser from "@/hooks/use-user"
import type { Problem, DifficultyLevel } from "@/lib/database-types"

export function useProblemsData() {
  const { data: user } = useUser()
  
  const {
    data: problemsData,
    isLoading,
    error,
    refetch
  } = useProblems({
    filters: {},
    sort: { field: 'created_at', direction: 'desc' },
    page: 1,
    limit: 100,
    userId: user?.id
  })

  return {
    problems: problemsData?.problems || [],
    isLoading,
    error: error?.message || null,
    refetch
  }
}

export function useFilteredProblems(
  problems: Problem[],
  difficultyFilter: DifficultyLevel | "all",
  statusFilter: "all" | "solved" | "unsolved"
) {
  return useMemo(() => {
    return problems.filter(problem => {
      // Difficulty filter
      const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter
      
      // Status filter
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "solved" && problem.user_stats?.is_solved) ||
                           (statusFilter === "unsolved" && !problem.user_stats?.is_solved)
      
      return matchesDifficulty && matchesStatus
    })
  }, [problems, difficultyFilter, statusFilter])
}
