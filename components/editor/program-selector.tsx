"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Problem, DifficultyLevel } from "@/lib/database-types"

interface ProblemSelectorProps {
  className?: string;
  problems: Problem[]
  selectedProblem: Problem
  onProblemChange: (problemId: string) => void
}

const getDifficultyColor = (difficulty: DifficultyLevel) => {
  const colors = {
    "easy": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "hard": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }
  return colors[difficulty]
}

const formatCategories = (categories?: string[]) => {
  if (!categories || categories.length === 0) return "General"
  return categories.slice(0, 2).join(", ") + (categories.length > 2 ? "..." : "")
}

export function ProblemSelector({ problems, selectedProblem, onProblemChange, className }: ProblemSelectorProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <Select value={selectedProblem.id} onValueChange={onProblemChange}>
          <SelectTrigger className="w-full min-w-[300px]">
            <SelectValue>
              <div className="flex items-center gap-2 w-full">
                <span className="truncate">{selectedProblem.title}</span>
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </Badge>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="h-[500px]">
            {problems.map((problem) => (
              <SelectItem key={problem.id} value={problem.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{problem.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCategories(problem.categories)} • {problem.acceptance_rate}% acceptance
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {problem.user_stats?.is_solved && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Solved" />
                    )}
                    {problem.user_stats && problem.user_stats.total_attempts > 0 && !problem.user_stats.is_solved && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Attempted" />
                    )}
                    <Badge variant="outline" className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
