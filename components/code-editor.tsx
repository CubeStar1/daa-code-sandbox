"use client"

import { Button } from "@/components/ui/button"
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block"
import { Copy, Play, Loader2, Eye, Edit, Check } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Textarea } from "@/components/ui/textarea"
import type { Program } from "@/lib/types"

interface CodeEditorProps {
  program: Program
  code: string
  onCodeChange: (code: string) => void
  onRun: () => void
  onCopy: () => void
  isRunning: boolean
}

export function CodeEditor({ program, code, onCodeChange, onRun, onCopy, isRunning }: CodeEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  const shikiTheme = theme === "dark" ? "github-dark" : "github-light"

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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center">
          <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium mr-2">C</span>
          <span className="hidden md:block text-sm text-muted-foreground">{program.name.toLowerCase().replace(/\s+/g, "-")}.c</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <Eye className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? "Preview" : "Edit"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" onClick={onRun} disabled={isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <Textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="font-mono text-sm h-full resize-none border-0 rounded-none focus-visible:ring-0"
            placeholder="Enter your C code here..."
          />
        ) : (
          <CodeBlock className="h-full border-0 rounded-none">
            <CodeBlockCode code={code} language="c" theme={shikiTheme} />
          </CodeBlock>
        )}
      </div>
    </div>
  )
}
