"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Play, Loader2, Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import Editor from "@monaco-editor/react"
import { useEditorStore } from "@/lib/stores/editor-store"
import { useSubmitCode } from "@/hooks/use-submit-code"
import { useProblem } from "@/hooks/use-problems-api"
import type { ProgrammingLanguage } from "@/lib/database-types"
import useUser from "@/hooks/use-user"
import { useParams } from "next/navigation"

const getLanguageDisplayName = (language: ProgrammingLanguage): string => {
  const languageMap: Record<ProgrammingLanguage, string> = {
    'c': 'C',
    'cpp': 'C++',
    'java': 'Java',
    'python': 'Python',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'go': 'Go',
    'rust': 'Rust',
    'c#': 'C#'
  }
  return languageMap[language] || language
}

const getMonacoLanguage = (language: ProgrammingLanguage): string => {
  const monacoMap: Record<ProgrammingLanguage, string> = {
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
  return monacoMap[language] || language
}

export function CodeEditor() {
  const [copied, setCopied] = useState(false)
  const { theme: appTheme } = useTheme()
  const { data: user } = useUser()
  const params = useParams()
  const slug = params.slug as string

  const {
    code,
    selectedLanguage,
    isRunning,
    setCode,
    changeLanguage,
    runCode,
    copyCode
  } = useEditorStore()

  const { submitCode, isSubmitting } = useSubmitCode()
  
  // Get current problem data
  const { data: problemData } = useProblem({ 
    slug, 
    userId: user?.id 
  })
  const currentProblem = problemData?.problem

  const userId = user?.id || "temp-user-id"

  const handleCopy = async () => {
    const success = await copyCode()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async () => {
    if (userId && currentProblem) {
      await submitCode(currentProblem.id, userId)
    }
  }

  if (!currentProblem) return null

  return (
    <div className="h-full flex flex-col bg-card rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-border dark:bg-[#333333]">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
                  {getLanguageDisplayName(selectedLanguage)}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => changeLanguage('c')}>C</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('cpp')}>C++</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('java')}>Java</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('python')}>Python</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('javascript')}>JavaScript</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('typescript')}>TypeScript</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('go')}>Go</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('rust')}>Rust</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => changeLanguage('c#')}>C#</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="hidden md:block text-sm text-muted-foreground">
            {currentProblem.title.toLowerCase().replace(/\s+/g, "-")}.{selectedLanguage}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={runCode} 
            disabled={isRunning || isSubmitting} 
            className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-500"
          >
            {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={isRunning || isSubmitting || !code.trim()} 
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Editor
          height="100%"
          language={getMonacoLanguage(selectedLanguage)}
          theme={appTheme === "dark" ? "vs-dark" : "vs"}
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true, // Ensures editor resizes correctly
            cursorBlinking: 'smooth',
            suggest: {
              showFields: false,
              showFunctions: false
            },
            bracketPairColorization: {
              enabled: true
            },
          }}
        />
      </div>
    </div>
  )
}
