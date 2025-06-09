"use client"

import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { ExecutionStats } from "@/lib/types"

interface InputOutputProps {
  input: string
  onInputChange: (input: string) => void
  output: string
  stats?: ExecutionStats
}

export function InputOutput({ input, onInputChange, output, stats }: InputOutputProps) {
  const [activeTab, setActiveTab] = useState("input");
  useEffect(() => {
    if (output && output.trim() !== '' && output.trim() !== 'Click "Run" to execute your code...') {
      setActiveTab("output");
    }
  }, [output]);

  return (
    <div className="h-full flex flex-col bg-card rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-2 dark:bg-[#333333]">
          <TabsList>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          {stats && (stats.time !== null || stats.memory !== null) && (
            <div className="flex gap-2">
              {stats.time !== null && <Badge variant="outline" className="text-xs">Time: {stats.time}s</Badge>}
              {stats.memory !== null && <Badge variant="outline" className="text-xs">Memory: {stats.memory} KB</Badge>}
            </div>
          )}
        </div>
        <TabsContent value="input" className="flex-1 p-0 mt-0">
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className="font-mono text-sm h-full resize-none border-0 rounded-none focus-visible:ring-0 bg-card"
            placeholder="Enter input for your program (if needed)..."
          />
        </TabsContent>
        <TabsContent value="output" className="flex-1 p-0 mt-0 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm p-4 h-full">{output || 'Click "Run" to execute your code...'}</pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}
