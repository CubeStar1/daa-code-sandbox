"use client";

import React from 'react';
import { useRouter, useParams } from "next/navigation";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useProblem, useProblems } from "@/hooks/use-problems-api";
import { problemNavigation } from "@/lib/utils/problem-navigation";
import { ProblemSelector } from "@/components/editor/program-selector";
import { ProviderInfoPopover } from "@/components/editor/provider-info-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import useUser from "@/hooks/use-user";

const MobileNavbar: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: user } = useUser();
  
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

  if (!currentProblem) return null;

  return (
    <div className="bg-background sticky top-0 z-50 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <ProblemSelector
            problems={problems}
            selectedProblem={currentProblem}
            onProblemChange={handleProblemChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <ProviderInfoPopover 
            executionProvider={executionProvider}
            onExecutionProviderChange={setExecutionProvider}
          />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
