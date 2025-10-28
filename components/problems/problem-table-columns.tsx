import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, Circle, Play, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Problem, DifficultyLevel } from "@/lib/database-types"

const getDifficultyColor = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
    case "hard":
      return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
  }
}

const getDifficultyIcon = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case "easy":
      return "●"
    case "medium":
      return "●●"
    case "hard":
      return "●●●"
  }
}

export function useProblemTableColumns() {
  const router = useRouter()

  const handleProblemClick = (problem: Problem) => {
    router.push(`/problems/${problem.slug}`)
  }

  const columns = useMemo<ColumnDef<Problem>[]>(() => [
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const problem = row.original
        if (problem.user_stats?.is_solved) {
          return <CheckCircle2 className="h-5 w-5 text-green-600" />
        } else if ((problem.user_stats?.total_attempts || 0) > 0) {
          return <Circle className="h-5 w-5 text-yellow-600" />
        } else {
          return <Circle className="h-5 w-5 text-muted-foreground" />
        }
      },
      enableSorting: false,
      size: 60,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            ID
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.getValue("id")}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Title
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const problem = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium hover:text-blue-600 transition-colors">
              {problem.title}
            </span>
            {problem.is_premium && (
              <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                Premium
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'difficulty',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Difficulty
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as DifficultyLevel
        return (
          <Badge 
            variant="secondary" 
            className={getDifficultyColor(difficulty)}
          >
            <span className="mr-1">{getDifficultyIcon(difficulty)}</span>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        )
      },
      sortingFn: (a, b) => {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
        return difficultyOrder[a.original.difficulty] - difficultyOrder[b.original.difficulty]
      },
      size: 120,
    },
    {
      accessorKey: 'acceptance_rate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Acceptance
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {(row.getValue("acceptance_rate") as number).toFixed(1)}%
        </span>
      ),
      size: 120,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const problem = row.original
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              handleProblemClick(problem)
            }}
            className="h-8 w-8 p-0"
          >
            <Play className="h-4 w-4" />
          </Button>
        )
      },
      enableSorting: false,
      size: 80,
    },
  ], [router])

  return { columns, handleProblemClick }
}
