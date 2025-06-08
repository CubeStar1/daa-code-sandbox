"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Program } from "@/lib/types"

interface ProgramSelectorProps {
  programs: Program[]
  selectedProgram: Program
  onProgramChange: (programId: string) => void
}

const getCategoryColor = (category: string) => {
  const colors = {
    "Brute Force": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "Divide and Conquer": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "Decrease and Conquer": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "Transform and Conquer": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "Space and Time Tradeoffs": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "Dynamic Programming": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    "Greedy Technique": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Backtracking: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    "Branch and Bound": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  }
  return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
}

export function ProgramSelector({ programs, selectedProgram, onProgramChange }: ProgramSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Select value={selectedProgram.id} onValueChange={onProgramChange}>
          <SelectTrigger className="w-[500px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{selectedProgram.name}</span>
                <Badge variant="outline" className={`text-xs ${getCategoryColor(selectedProgram.category)}`}>
                  {selectedProgram.category}
                </Badge>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="h-[500px]">
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-medium">{program.name}</span>
                    {/* <span className="text-xs text-muted-foreground">{program.description}</span> */}
                  </div>
                  <Badge variant="outline" className={`ml-2 text-xs ${getCategoryColor(program.category)}`}>
                    {program.category}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
