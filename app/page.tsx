"use client"

import { useState } from "react"
import { programs } from "@/lib/programs"
import { executeCode } from "@/lib/judge0"
import { ProgramSelector } from "@/components/program-selector"
import { ProgramDescription } from "@/components/program-description"
import { ComplexityAnalysis } from "@/components/complexity-analysis"
import { CodeEditor } from "@/components/code-editor"
import { InputOutput } from "@/components/input-output"
import { ThemeToggle } from "@/components/theme-toggle"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Program, ExecutionResult } from "@/lib/types"

export default function CodeSandbox() {
  const [selectedProgram, setSelectedProgram] = useState<Program>(programs[0])
  const [code, setCode] = useState(programs[0].code)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [executionStats, setExecutionStats] = useState<{ time?: number; memory?: number }>({})
  const [activeTab, setActiveTab] = useState("description")

  const handleProgramChange = (programId: string) => {
    const program = programs.find((p) => p.id === programId)
    if (program) {
      setSelectedProgram(program)
      setCode(program.code)
      setOutput("")
      setExecutionStats({})
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("")
    setExecutionStats({})

    const result: ExecutionResult = await executeCode(code, input)

    setOutput(result.output)
    setExecutionStats({
      time: result.time,
      memory: result.memory,
    })
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b">
        <div className="container mx-auto p-4 flex items-center">
          <div className="flex-1 flex justify-start"> {/* Left part with Name */}
            <h1 className="text-xl font-bold">DAA Lab</h1>
          </div>
          <ProgramSelector
            programs={programs}
            selectedProgram={selectedProgram}
            onProgramChange={handleProgramChange}
          />
          <div className="flex-1 flex justify-end"> {/* Right part with ThemeToggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-5rem)] overflow-y-hidden">
          {/* Left panel - Problem description and complexity analysis */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col pt-2 px-2">
                <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="complexity">Complexity</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="flex-1 mt-0">
                  <ProgramDescription program={selectedProgram} />
                </TabsContent>
                <TabsContent value="complexity" className="flex-1 mt-0">
                  <ComplexityAnalysis program={selectedProgram} />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right panel - Code editor and I/O */}
          <ResizablePanel defaultSize={70}>
            <ResizablePanelGroup direction="vertical">
              {/* Code editor */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <div className="h-full p-1">
                  <CodeEditor
                    program={selectedProgram}
                    code={code}
                    onCodeChange={setCode}
                    onRun={runCode}
                    onCopy={copyCode}
                    isRunning={isRunning}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Input/Output */}
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full p-1">
                  <InputOutput input={input} onInputChange={setInput} output={output} stats={executionStats} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
