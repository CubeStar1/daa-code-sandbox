"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Response } from "@/components/ai-elements/response"
import { useState } from "react"
import type { Problem, ProgrammingLanguage } from "@/lib/database-types"

interface ComplexityAnalysisProps {
  problem: Problem
}

export function ComplexityAnalysis({ problem }: ComplexityAnalysisProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('cpp')
  const editorial = problem.editorial
  
  // Map our language types to common syntax highlighting names
  const getLanguageForHighlighting = (lang: ProgrammingLanguage): string => {
    const languageMap: Record<ProgrammingLanguage, string> = {
      'c': 'c',
      'cpp': 'cpp',
      'java': 'java',
      'python': 'python',
      'javascript': 'javascript',
      'typescript': 'typescript',
      'go': 'go',
      'rust': 'rust',
      'c#': 'csharp'
    }
    return languageMap[lang] || lang
  }

  if (!editorial) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No editorial available for this problem yet.</p>
          <p className="text-sm mt-2">Check back later for detailed solutions and analysis.</p>
        </div>
      </div>
    )
  }

  const availableLanguages = Object.keys(editorial.code_solutions || {}).filter(
    lang => editorial.code_solutions[lang as ProgrammingLanguage]?.trim()
  ) as ProgrammingLanguage[]

  return (
    <div className="h-full p-4">
      <h2 className="text-lg font-semibold mb-4">Editorial & Solution</h2>
      <ScrollArea className="h-[calc(100vh-17rem)] pr-2">
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium mb-2">{editorial.approach_title}</h3>
            <Response className="text-sm prose-sm dark:prose-invert max-w-none">
              {editorial.approach_description}
            </Response>
          </div>

          {editorial.intuition && (
            <div>
              <Separator />
              <h3 className="text-md font-medium mb-2 mt-4">Intuition</h3>
              <Response 
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
              >
                {editorial.intuition}
              </Response>
            </div>
          )}

          {editorial.algorithm_steps && (
            <div>
              <Separator />
              <h3 className="text-md font-medium mb-2 mt-4">Algorithm</h3>
              <Response 
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
              >
                {editorial.algorithm_steps}
              </Response>
            </div>
          )}

          {editorial.complexity_analysis && (
            <div>
              <Separator />
              <h3 className="text-md font-medium mb-2 mt-4">Complexity Analysis</h3>
              <Response 
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
              >
                {editorial.complexity_analysis}
              </Response>
            </div>
          )}

          {availableLanguages.length > 0 && (
            <div>
              <Separator />
              <div className="mt-4">
                <h3 className="text-md font-medium mb-3">Implementation</h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableLanguages.map((lang) => (
                    <Button
                      key={lang}
                      variant={selectedLanguage === lang ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLanguage(lang)}
                      className="text-xs"
                    >
                      {lang.toUpperCase()}
                    </Button>
                  ))}
                </div>

                <Response className="text-sm prose prose-sm dark:prose-invert max-w-none">
                  {`\`\`\`${getLanguageForHighlighting(selectedLanguage)}\n${editorial.code_solutions[selectedLanguage] || 'No solution available'}\n\`\`\``}
                </Response>
              </div>
            </div>
          )}

          <div>
            <Separator />
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>👍 {editorial.upvotes}</span>
                <span>👎 {editorial.downvotes}</span>
              </div>
              {editorial.is_official && (
                <Badge variant="secondary" className="text-xs">
                  Official Editorial
                </Badge>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
