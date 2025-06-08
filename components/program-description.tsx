"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Program } from "@/lib/types"

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

interface ProgramDescriptionProps {
  program: Program
}

export function ProgramDescription({ program }: ProgramDescriptionProps) {
  return (
    <Card className="h-full border-0 shadow-none flex flex-col">
      <CardHeader className="flex-shrink-0 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{program.name}</CardTitle>
          <Badge variant="outline" className={getCategoryColor(program.category)}>
            {program.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-4 py-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4 pr-4">
            <div className="text-muted-foreground">{program.description}</div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Examples:</h3>
                <div className="space-y-3">
                  {program.examples.map((example, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      <div className="text-sm font-mono mb-2">
                        <div>
                          <strong>Input:</strong> {example.input.replace(/\n/g, " ")}
                        </div>
                        <div>
                          <strong>Output:</strong> {example.output}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{example.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Algorithm Steps:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  {program.algorithmSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Key Properties:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {program.keyProperties.map((property, index) => (
                    <li key={index}>{property}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
