"use client"

import React from 'react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { List, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Problem, DifficultyLevel } from "@/lib/database-types"

interface ProblemSheetProps {
  problems: Problem[]
  selectedProblem: Problem
  onProblemChange: (problemId: string) => void
}

const getCategoryColor = (category: string) => {
  const colors = {
    "Brute Force": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    "Divide and Conquer": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "Decrease and Conquer": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    "Transform and Conquer": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    "Space and Time Tradeoffs": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "Dynamic Programming": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "Greedy Technique": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    "Backtracking": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    "Branch and Bound": "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  }
  return colors[category as keyof typeof colors] || "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
}

export function ProblemSheet({ problems, selectedProblem, onProblemChange }: ProblemSheetProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const filteredProblems = problems.filter((problem: Problem) =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (problem.categories && problem.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  const handleProblemSelect = (problemId: string) => {
    onProblemChange(problemId)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 py-2 hover:bg-accent" aria-label="Open Problem List">
          <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-muted/40">
            <List className="h-4 w-4 text-foreground" />
          </div>
          <span className="hidden sm:inline-block font-medium">Problem List</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col max-w-3xl">
        <SheetHeader className=" border-b flex-shrink-0">
          <SheetTitle className="text-lg font-semibold">Select Problem</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Choose a problem to work on from the list below.
          </SheetDescription>
        </SheetHeader>
        
        <div className="border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>
        
        <ScrollArea className="h-full">
            {filteredProblems.map((problem: Problem) => (
            <SheetClose key={problem.id} asChild>
                <Button
                variant={selectedProblem.id === problem.id ? "secondary" : "ghost"}
                className="w-full justify-start h-auto p-4 text-left hover:bg-accent/50 transition-colors"
                onClick={() => handleProblemSelect(problem.id)}
                >
                <div className="flex flex-col items-start w-full space-y-2">
                    <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-foreground">{problem.title}</span>
                    <div className="flex flex-wrap gap-1">
                      {problem.categories?.slice(0, 2).map((category) => (
                        <Badge 
                          key={category}
                          variant="outline" 
                          className={`text-xs border-current ${getCategoryColor(category)}`}
                        >
                          {category}
                        </Badge>
                      ))}
                      {problem.categories && problem.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{problem.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                    </div>
                    
                </div>
                </Button>
            </SheetClose>
            ))}
            {filteredProblems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-muted-foreground text-sm">No problems found</div>
                <div className="text-xs text-muted-foreground mt-1">Try adjusting your search terms</div>
            </div>
            )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
