"use client";

import React from 'react';
import { useRouter, useParams } from "next/navigation";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useProblem, useProblems } from "@/hooks/use-problems-api";
import { problemNavigation } from "@/lib/utils/problem-navigation";
import { ProblemSheet } from "@/components/editor/problem-sheet";
import { ProviderInfoPopover } from "@/components/editor/provider-info-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import TimerComponent from "@/components/editor/timer-component";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import Image from "next/image";
import useUser from "@/hooks/use-user";

const NavbarComponent: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: user } = useUser();
  const icon = process.env.NEXT_PUBLIC_APP_LOGO!;
  
  const {
    executionProvider,
    setExecutionProvider,
  } = useEditorStore();

  // Get current problem data
  const { data: problemData } = useProblem({ 
    slug, 
    userId: user?.id 
  });

  // Get all problems for navigation
  const { data: problemsData } = useProblems({
    filters: {},
    sort: { field: 'created_at', direction: 'desc' },
    page: 1,
    limit: 100,
    userId: user?.id
  });

  const currentProblem = problemData?.problem;
  const problems = problemsData?.problems || [];

  const handleProblemChange = (problemId: string) => {
    const problem = problemNavigation.getProblemById(problemId, problems);
    if (problem) {
      router.push(`/problems/${problem.slug}`);
    }
  };

  const handleNextProblem = () => {
    if (!currentProblem) return;
    const nextProblem = problemNavigation.getNextProblem(currentProblem, problems);
    if (nextProblem) {
      router.push(`/problems/${nextProblem.slug}`);
    }
  };

  const handlePreviousProblem = () => {
    if (!currentProblem) return;
    const prevProblem = problemNavigation.getPreviousProblem(currentProblem, problems);
    if (prevProblem) {
      router.push(`/problems/${prevProblem.slug}`);
    }
  };

  const handleRandomProblem = () => {
    if (!currentProblem) return;
    const randomProblem = problemNavigation.getRandomProblem(currentProblem, problems);
    if (randomProblem) {
      router.push(`/problems/${randomProblem.slug}`);
    }
  };

  if (!currentProblem) return null;

  return (
    <div className="bg-background border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src={icon} alt="CodeSandbox Logo" width={24} height={24} />
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
