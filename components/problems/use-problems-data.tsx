import { useState, useEffect, useMemo } from "react"
import { ProblemService } from "@/lib/database-service"
import type { Problem, DifficultyLevel } from "@/lib/database-types"

interface ProblemsState {
  problems: Problem[]
  isLoading: boolean
  error: string | null
}

export function useProblemsData() {
  const [state, setState] = useState<ProblemsState>({
    problems: [],
    isLoading: true,
    error: null
  })

  // Load problems on mount
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        const response = await ProblemService.getProblems()
        setState(prev => ({ 
          ...prev, 
          problems: response.problems, 
          isLoading: false 
        }))
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: err instanceof Error ? err.message : 'Failed to load problems', 
          isLoading: false 
        }))
      }
    }

    loadProblems()
  }, [])

  const refetch = () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    // Re-trigger the effect by changing a dependency if needed
  }

  return {
    ...state,
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
