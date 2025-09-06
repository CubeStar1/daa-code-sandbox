"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEditorStore } from "@/lib/stores/editor-store"
import { ProblemService } from "@/lib/database-service"
import NavbarComponent from "@/components/editor/navbar-component"
import MobileNavbar from "@/components/editor/mobile-navbar"
import { ProblemDetailsTabs } from "@/components/editor/problem-details-tabs"
import { CodeEditor } from "@/components/editor/code-editor"
import { InputOutput } from "@/components/editor/input-output"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Skeleton } from "@/components/ui/skeleton"
import type { Problem, ProgrammingLanguage } from "@/lib/database-types"
import useUser from "@/hooks/use-user"
import { useRouter } from "next/navigation"

export default function ProblemEditor() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const isMobileView = useIsMobile()
  const { toast } = useToast()
  
  const {
    currentProblem,
    problems,
    isLoading,
    error,
    loadProblemsData,
    loadProblemBySlug,
    navigateToNext,
    navigateToPrevious,
    navigateToRandom
  } = useEditorStore()

  // Load data on mount and when slug changes
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all problems if not already loaded
        if (problems.length === 0) {
          await loadProblemsData()
        }
        
        // Load the specific problem by slug
        await loadProblemBySlug(slug)
      } catch (err) {
        console.error('Error loading problem:', err)
        toast({
          title: "Error",
          description: "Failed to load problem. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (slug) {
      loadData()
    }
  }, [slug, problems.length, loadProblemsData, loadProblemBySlug, toast])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          const nextProblem = navigateToNext()
          if (nextProblem) {
            router.push(`/problems/${nextProblem.slug}`)
          }
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault()
          const prevProblem = navigateToPrevious()
          if (prevProblem) {
            router.push(`/problems/${prevProblem.slug}`)
          }
        } else if (event.key === 'r') {
          event.preventDefault()
          const randomProblem = navigateToRandom()
          if (randomProblem) {
            router.push(`/problems/${randomProblem.slug}`)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router, navigateToNext, navigateToPrevious, navigateToRandom])

  if (isLoading || !currentProblem) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Problem Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The problem you're looking for doesn't exist."}
          </p>
          <button 
            onClick={() => window.location.href = '/editor'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Go to Editor
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        {isMobileView ? (
          <MobileNavbar />
        ) : (
          <NavbarComponent />
        )}

        <div className="flex-1 p-2">
          {isMobileView === undefined ? (
            null 
          ) : isMobileView ? (
            // Mobile layout
            <div className="flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="h-full flex flex-col">
                <div className="h-[65%] p-1 border-b">
                  <CodeEditor />
                </div>
                <div className="h-[35%] p-1">
                  <InputOutput />
                </div>
              </div>
            </div>
          ) : (
            // Desktop Layout
            <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-5rem)] overflow-y-hidden gap-1">
              <ResizablePanel defaultSize={30} className="border rounded-lg">
                <ProblemDetailsTabs problem={currentProblem} />
              </ResizablePanel>

              <ResizableHandle withHandle className="my-1 bg-background hover:bg-[var(--color-section-splitter)] transition-all"/>

              <ResizablePanel defaultSize={70} className="">
                <ResizablePanelGroup direction="vertical" className="gap-1">
                  <ResizablePanel defaultSize={70} className="border rounded-lg">
                    <div className="h-full">
                      <CodeEditor />
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle className=" bg-background hover:bg-[var(--color-section-splitter)] transition-all"/>

                  <ResizablePanel defaultSize={30} className="border rounded-lg">
                    <div className="h-full">
                      <InputOutput />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
      <Toaster />
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-16 border-b flex items-center px-4">
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="flex-1 p-2">
        <div className="flex gap-2 h-[calc(100vh-5rem)]">
          <div className="w-[30%] border rounded-lg p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="w-[70%] flex flex-col gap-2">
            <div className="h-[70%] border rounded-lg p-4">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-full w-full" />
            </div>
            <div className="h-[30%] border rounded-lg p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
