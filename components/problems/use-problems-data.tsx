import { useProblems } from "@/hooks/use-problems-api"
import useUser from "@/hooks/use-user"
import { useMemo } from "react"
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
      // Filter by difficulty
      if (difficultyFilter !== "all" && problem.difficulty !== difficultyFilter) {
        return false
      }

      // Filter by status
      if (statusFilter !== "all") {
        const isSolved = problem.user_stats?.is_solved || false
        if (statusFilter === "solved" && !isSolved) return false
        if (statusFilter === "unsolved" && isSolved) return false
      }

      return true
    })
  }, [problems, difficultyFilter, statusFilter])
}
