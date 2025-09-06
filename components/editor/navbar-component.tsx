"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/stores/editor-store";
import { ProblemSheet } from "@/components/editor/problem-sheet";
import { ProviderInfoPopover } from "@/components/editor/provider-info-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import TimerComponent from "@/components/editor/timer-component";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import Image from "next/image";

const NavbarComponent: React.FC = () => {
  const router = useRouter();
  const {
    problems,
    currentProblem,
    executionProvider,
    setExecutionProvider,
    navigateToNext,
    navigateToPrevious,
    navigateToRandom,
    navigateToProblem
  } = useEditorStore();

  const handleProblemChange = (problemId: string) => {
    const problem = navigateToProblem(problemId);
    if (problem) {
      router.push(`/editor/${problem.slug}`);
    }
  };

  const handleNextProblem = () => {
    const nextProblem = navigateToNext();
    if (nextProblem) {
      router.push(`/editor/${nextProblem.slug}`);
    }
  };

  const handlePreviousProblem = () => {
    const prevProblem = navigateToPrevious();
    if (prevProblem) {
      router.push(`/editor/${prevProblem.slug}`);
    }
  };

  const handleRandomProblem = () => {
    const randomProblem = navigateToRandom();
    if (randomProblem) {
      router.push(`/editor/${randomProblem.slug}`);
    }
  };

  if (!currentProblem) return null;

  return (
    <div className="bg-background border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src="/code-sandbox-logo.png" alt="CodeSandbox Logo" width={24} height={24} />
            <h1 className="text-lg font-semibold hidden sm:block">LeetCode Assistant</h1>
          </div>
          
          <ProblemSheet
            problems={problems}
            selectedProblem={currentProblem}
            onProblemChange={handleProblemChange}
          />

          <TooltipProvider>
            <div className="flex items-center gap-1 ml-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handlePreviousProblem}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous Question (Ctrl + ←)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleNextProblem}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next Question (Ctrl + →)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleRandomProblem}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Random Question (Ctrl + R)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <ProviderInfoPopover 
            executionProvider={executionProvider}
            onExecutionProviderChange={setExecutionProvider}
          />
          <TimerComponent />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default NavbarComponent;
