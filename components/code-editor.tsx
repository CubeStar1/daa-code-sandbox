"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Play, Loader2, Check, ChevronDown } from "lucide-react" // Removed Eye, Edit
import { useState } from "react"
import { useTheme } from "next-themes"
import Editor from "@monaco-editor/react"; // Added Monaco Editor
import type { Program } from "@/lib/types"

interface CodeEditorProps {
  program: Program
  code: string
  onCodeChange: (code: string) => void
  onRun: () => void
  onCopy: () => void
  isRunning: boolean
  language: 'c' | 'cpp'
  onLanguageChange: (language: 'c' | 'cpp') => void
}

export function CodeEditor({ program, code, onCodeChange, onRun, onCopy, isRunning, language, onLanguageChange }: CodeEditorProps) {
  // const [isEditing, setIsEditing] = useState(false) // Removed isEditing state
  const [copied, setCopied] = useState(false)
  const { theme: appTheme } = useTheme() // Renamed to appTheme to avoid potential conflicts

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy()
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-border dark:bg-[#333333]">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
                  {language === 'cpp' ? 'C++' : 'C'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => onLanguageChange('c')}>C</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onLanguageChange('cpp')}>C++</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="hidden md:block text-sm text-muted-foreground">{program.name.toLowerCase().replace(/\s+/g, "-")}.{language}</span>
        </div>
        <div className="flex gap-2">
          {/* Edit/Preview button removed */}
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" onClick={onRun} disabled={isRunning} className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Editor
          height="100%"
          language={language}
          theme={appTheme === "dark" ? "vs-dark" : "vs"}
          value={code}
          onChange={(value) => onCodeChange(value || "")}
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
