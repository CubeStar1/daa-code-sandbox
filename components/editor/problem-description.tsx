"use client"

import { CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Response } from "@/components/ai-elements/response"
import type { Problem, DifficultyLevel } from "@/lib/database-types"

const getDifficultyColor = (difficulty: DifficultyLevel) => {
  const colors = {
    "easy": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "hard": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }
  return colors[difficulty]
}

interface ProblemDescriptionProps {
  problem: Problem
}

export function ProblemDescription({ problem }: ProblemDescriptionProps) {
  const exampleTestCases = problem.test_cases?.filter(tc => tc.is_example) || []

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{problem.title}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            {problem.user_stats?.is_solved && (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Solved
              </Badge>
            )}
          </div>
        </div>
        
        {problem.categories && problem.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {problem.categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Acceptance: {problem.acceptance_rate.toFixed(1)}%</span>
          <span>Submissions: {problem.total_submissions}</span>
          {problem.user_stats && (
            <span>Your attempts: {problem.user_stats.total_attempts}</span>
          )}
        </div>
      </div>
     
      <ScrollArea className="h-[calc(100vh-17rem)] pr-2">
        <div className="space-y-4">
          <Response className="text-sm prose prose-sm dark:prose-invert max-w-none">
            {problem.description}
          </Response>

          {problem.constraints && (
            <div className="space-y-2">
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Constraints:</h3>
                <Response className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                  {problem.constraints}
                </Response>
              </div>
            </div>
          )}

          {problem.hints && problem.hints.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Hints:</h3>
                <Accordion type="single" collapsible className="w-full">
                  {problem.hints.map((hint, index) => (
                    <AccordionItem key={index} value={`hint-${index}`} className="border rounded-lg px-3 mb-2">
                      <AccordionTrigger className="text-sm text-blue-600 dark:text-blue-400 hover:no-underline hover:text-blue-700 dark:hover:text-blue-300">
                        Hint {index + 1}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-3">
                        <Response className="prose prose-sm dark:prose-invert max-w-none">
                          {hint}
                        </Response>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
