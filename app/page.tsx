"use client"

import { useEffect, useState } from "react" // Keep useState for other states
import { useIsMobile } from "@/hooks/use-mobile"
import { programs } from "@/lib/programs"
import { executeCode } from "@/lib/judge0"
import { ProgramSelector } from "@/components/program-selector"
import { ProgramDescription } from "@/components/program-description"
import { ComplexityAnalysis } from "@/components/complexity-analysis"
import { CodeEditor } from "@/components/code-editor"
import { InputOutput } from "@/components/input-output"
import { ThemeToggle } from "@/components/theme-toggle"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProviderInfoPopover } from "@/components/provider-info-popover";
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
  const [activeTab, setActiveTab] = useState("description");
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
      <div className="border-b">
        <div className="container mx-auto p-4 flex flex-col md:flex-row items-center gap-4">
          {/* Title Section */}
          <div className="w-full md:w-auto mb-2 md:mb-0 self-start md:self-center">
            <h1 className="text-xl font-bold">DAA Lab</h1>
          </div>

          {/* Centering Group: ProgramSelector and ProviderSelect */}
          {/* This group takes up the central space on desktop and centers its content */}
          <div className="w-full md:flex-1 flex flex-col md:flex-row md:justify-center items-center gap-y-2 md:gap-x-4">
            {/* Program Selector Wrapper */}
            <div className="w-full md:w-auto mb-2 md:mb-0">
              <ProgramSelector
                className="" // ProgramSelector component handles responsive width internally
                programs={programs}
                selectedProgram={selectedProgram}
                onProgramChange={handleProgramChange}
              />
            </div>

            {/* Provider Select and Info Popover Group */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select 
                value={executionProvider} 
                onValueChange={(value) => setExecutionProvider(value as 'judge0' | 'onecompiler')}
              >
                <SelectTrigger className="w-full md:w-[10rem]">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onecompiler">OneCompiler</SelectItem>
                  <SelectItem value="judge0">Judge0</SelectItem>
                </SelectContent>
              </Select>
              <ProviderInfoPopover />
              <div className="block md:hidden">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* ThemeToggle Section (Far right on desktop) */}
          {/* On mobile, this will be full-width and the toggle itself can be aligned (e.g., to the right) */}
          <div className="hidden md:block w-full md:w-auto mt-2 md:mt-0 md:ml-auto flex justify-end md:justify-start self-center">
            <ThemeToggle />
          </div>
        </div> {/* This was the missing closing div for the header container */}
      </div>

      <div className="flex-1">
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
        )}
      </div>
    </div>
    </>
  )
}
