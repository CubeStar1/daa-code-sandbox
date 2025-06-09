"use client"

import { useEffect, useState } from "react" // Keep useState for other states
import { useIsMobile } from "@/hooks/use-mobile"
import { programs } from "@/lib/programs"
import { executeCode } from "@/lib/judge0"
import NavbarComponent from "@/components/navbar-component"; 
// ProgramDescription import removed, handled by ProblemDetailsTabs
import { ProblemDetailsTabs } from "@/components/problem-details-tabs";
// ComplexityAnalysis import removed, handled by ProblemDetailsTabs
import { CodeEditor } from "@/components/code-editor"
import { InputOutput } from "@/components/input-output"
import { ThemeToggle } from "@/components/theme-toggle"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
// Tabs, TabsContent, TabsList, TabsTrigger removed as they are now encapsulated in ProblemDetailsTabs;
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { Program, ExecutionResult } from "@/lib/types"

export default function CodeSandbox() {
  const isMobileView = useIsMobile();
  const [selectedProgram, setSelectedProgram] = useState<Program>(programs[0])
  const [code, setCode] = useState(programs[0].code)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [executionStats, setExecutionStats] = useState<{ time?: number; memory?: number }>({})
  // const [activeTab, setActiveTab] = useState("description") // State moved to ProblemDetailsTabs;
  const [executionProvider, setExecutionProvider] = useState<'judge0' | 'onecompiler'>('onecompiler');
  const { toast } = useToast();

  const handleProgramChange = (programId: string) => {
    const program = programs.find((p) => p.id === programId)
    if (program) {
      setSelectedProgram(program);
      setCode(program.code);
      setInput(program.sampleInput || ""); // Set input to sampleInput or empty string
      setOutput("");
      setExecutionStats({});
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

    const result: ExecutionResult = await executeCode(code, input, executionProvider);

    if (result.isRateLimited) {
      toast({
        title: "Rate Limit Exceeded",
        description: result.error || "You've made too many requests. Please wait and try again.",
        variant: "destructive",
      });
      // Still set output to any error message provided, and clear stats
      setOutput(result.error || ""); 
      setExecutionStats({});
      setIsRunning(false);
      return;
    }

    setOutput(result.output);
    setExecutionStats({
      time: result.time,
      memory: result.memory,
    })
    setIsRunning(false)
  }

  return (
    <>
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarComponent 
        programs={programs}
        selectedProgram={selectedProgram}
        onProgramChange={handleProgramChange}
        executionProvider={executionProvider}
        onExecutionProviderChange={(value) => setExecutionProvider(value as 'judge0' | 'onecompiler')}
      />

      <div className="flex-1 p-2">
        {isMobileView === undefined ? (
          null // Or a loading spinner/placeholder
        ) : isMobileView ? (
          // Mobile layout: Only Code Editor & I/O
          <div className="flex flex-col h-[calc(100vh-12rem)] overflow-y-auto">
            {/* Panel: Code Editor & I/O - Takes full height */}
            <div className="h-full flex flex-col">
              {/* Code editor - takes more relative height */}
              <div className="h-[65%] p-1 border-b">
                <CodeEditor
                  program={selectedProgram}
                  code={code}
                  onCodeChange={setCode}
                  onRun={runCode}
                  onCopy={copyCode}
                  isRunning={isRunning}
                />
              </div>
              {/* Input/Output - takes less relative height */}
              <div className="h-[35%] p-1">
                <InputOutput input={input} onInputChange={setInput} output={output} stats={executionStats} />
              </div>
            </div>
          </div>
        ) : (
          // Desktop Layout
          <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-5rem)] overflow-y-hidden gap-1">
            {/* Left panel - Problem description and complexity analysis */}
            <ResizablePanel defaultSize={30} className="border rounded-lg">
              <ProblemDetailsTabs program={selectedProgram} />
            </ResizablePanel>

            <ResizableHandle withHandle className="my-1 bg-background hover:bg-[var(--color-section-splitter)] transition-all"/>

            {/* Right panel - Code editor and I/O */}
            <ResizablePanel defaultSize={70} className="">
              <ResizablePanelGroup direction="vertical" className="gap-1">
                {/* Code editor */}
                <ResizablePanel defaultSize={70} className="border rounded-lg">
                  <div className="h-full">
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

                <ResizableHandle withHandle className=" bg-background hover:bg-[var(--color-section-splitter)] transition-all"/>

                {/* Input/Output */}
                <ResizablePanel defaultSize={30} className="border rounded-lg">
                  <div className="h-full">
                    <InputOutput input={input} onInputChange={setInput} output={output} stats={executionStats} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
    </>
  )
}
