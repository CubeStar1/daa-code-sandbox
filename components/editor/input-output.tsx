"use client"

import { useState, useEffect } from "react";
import { useTheme } from "next-themes"
import Editor from "@monaco-editor/react";
import { useEditorStore } from "@/lib/stores/editor-store";

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

export function InputOutput() {
  const [activeTab, setActiveTab] = useState("input");
  const { theme } = useTheme();
  
  const {
    input,
    output,
    executionStats,
    isRunning,
    isSubmitting,
    testResults,
    submissionStatus,
    setInput
  } = useEditorStore();
  const { theme: appTheme } = useTheme()
  
  useEffect(() => {
    if (output && output.trim() !== '' && output.trim() !== 'Click "Run" to execute your code...') {
      setActiveTab("output");
    }
  }, [output]);

  const displayOutput = isRunning ? 'Running...' : isSubmitting ? 'Submitting...' : (output || 'Click "Run" to execute your code...')
  const isLoading = isRunning || isSubmitting

  const getOutputStatus = () => {
    if (isLoading) return 'loading'
    if (!output || output.trim() === '' || output.trim() === 'Click "Run" to execute your code...') return 'default'
    if (output.toLowerCase().includes('error') || output.toLowerCase().includes('exception')) return 'error'
    if (output.toLowerCase().includes('accepted') || output.toLowerCase().includes('success')) return 'success'
    return 'info'
  }

  const outputStatus = getOutputStatus()

  const getStatusIcon = () => {
    switch (outputStatus) {
      case 'loading': return <Clock className="h-4 w-4 animate-spin" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />
      default: return null
    }
  }

  const getOutputStyles = () => {
    switch (outputStatus) {
      case 'success': return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
      case 'error': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
      case 'info': return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
      case 'loading': return 'text-muted-foreground bg-muted/50'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-2 dark:bg-[#333333]">
          <TabsList>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          {executionStats && (executionStats.time || executionStats.memory) && (
            <div className="flex gap-2">
              {executionStats.time && <Badge variant="outline" className="text-xs">Time: {executionStats.time}</Badge>}
              {executionStats.memory && <Badge variant="outline" className="text-xs">Memory: {executionStats.memory}</Badge>}
            </div>
          )}
        </div>
        <TabsContent value="input" className="flex-1 p-4 mt-0">
          <div className="h-full">
            <Editor
              height="100%"
              language="markdown"
              theme={appTheme === "dark" ? "vs-dark" : "vs"}
              value={input}
              onChange={(value) => setInput(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true, 
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
        </TabsContent>
        <TabsContent value="output" className="flex-1 p-0 mt-0">
          <ScrollArea className="h-full">
            {testResults && testResults.length > 0 ? (
              // Test case results view
              <div className="p-4 space-y-4">
                {/* Header with overall status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {submissionStatus === 'accepted' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`font-semibold text-lg ${
                      submissionStatus === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {submissionStatus === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                    </span>
                  </div>
                  {executionStats?.time && (
                    <Badge variant="outline" className="text-xs">
                      Runtime: {executionStats.time}
                    </Badge>
                  )}
                </div>

                {/* Test case tabs */}
                <div className="border rounded-lg overflow-hidden">
                  <Tabs defaultValue="testcase" className="w-full">
                    <div className="border-b bg-muted/30">
                      <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
                        <TabsTrigger value="testcase" className="px-4 py-2 data-[state=active]:bg-background">
                          Testcase
                        </TabsTrigger>
                        <TabsTrigger value="result" className="px-4 py-2 data-[state=active]:bg-background">
                          Test Result
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="testcase" className="p-4 m-0">
                      {/* Test case selector */}
                      <div className="flex gap-2 mb-4">
                        {testResults.map((result, index) => (
                          <Badge
                            key={index}
                            variant={result.passed ? "default" : "destructive"}
                            className={`cursor-pointer ${
                              result.passed 
                                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200" 
                                : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            Case {index + 1}
                          </Badge>
                        ))}
                      </div>

                      {/* Show first test case details */}
                      {testResults[0] && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Input</h4>
                            <div className="bg-muted rounded-md p-3 font-mono text-sm">
                              <pre className="whitespace-pre-wrap">{testResults[0].input}</pre>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Output</h4>
                            <div className="bg-muted rounded-md p-3 font-mono text-sm">
                              <pre className="whitespace-pre-wrap">{testResults[0].actual_output || 'No output'}</pre>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Expected</h4>
                            <div className="bg-muted rounded-md p-3 font-mono text-sm">
                              <pre className="whitespace-pre-wrap">{testResults[0].expected_output}</pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="result" className="p-4 m-0">
                      <div className="space-y-2">
                        {testResults.map((result, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono">{index + 1}</span>
                              <span className="text-sm font-mono">[{result.input}]</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            ) : (
              // Simple output view for run results
              <div className={`m-3 p-4 rounded-lg font-mono text-sm min-h-[calc(100%-1.5rem)] ${getOutputStyles()}`}>
                <div className="flex items-center gap-2 mb-3">
                  {getStatusIcon()}
                  <span className="font-medium">
                    {outputStatus === 'loading' ? 'Executing...' : 
                     outputStatus === 'success' ? 'Output' : 
                     outputStatus === 'error' ? 'Error' : 
                     'Output'}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {displayOutput}
                </pre>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
