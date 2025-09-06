"use client"

import { useState } from "react"
import { 
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table"
import type { DifficultyLevel } from "@/lib/database-types"
import {
  useProblemTableColumns,
  ProblemsFilters,
  ProblemsTable,
  ProblemsLoadingSkeleton,
  ProblemsErrorState,
  useProblemsData,
  useFilteredProblems,
} from "@/components/problems"

export default function ProblemsPage() {
  const { problems, isLoading, error, refetch } = useProblemsData()
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  
  // Custom filter states
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "solved" | "unsolved">("all")

  // Get columns and handlers
  const { columns, handleProblemClick } = useProblemTableColumns()

  // Filter data based on custom filters
  const filteredProblems = useFilteredProblems(problems, difficultyFilter, statusFilter)

  // Create table instance
  const table = useReactTable({
    data: filteredProblems,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    globalFilterFn: 'includesString',
  })

  if (isLoading) {
    return <ProblemsLoadingSkeleton />
  }

  if (error) {
    return <ProblemsErrorState error={error} onRetry={refetch} />
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Problems</h1>
        <p className="text-muted-foreground">
          Practice coding interview questions • {table.getFilteredRowModel().rows.length} problems
        </p>
      </div>

      {/* Filters */}
      <ProblemsFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        table={table}
      />

      {/* Problems Table */}
      <ProblemsTable table={table} onRowClick={handleProblemClick} />

      {/* Stats Footer */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Showing {table.getFilteredRowModel().rows.length} of {problems.length} problems
      </div>
    </div>
  )
}
