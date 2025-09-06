"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/stores/editor-store";
import { ProblemSelector } from "@/components/editor/program-selector";
import { ProviderInfoPopover } from "@/components/editor/provider-info-popover";
import { ThemeToggle } from "@/components/theme-toggle";

const MobileNavbar: React.FC = () => {
  const router = useRouter();
  const {
    problems,
    currentProblem,
    executionProvider,
    setExecutionProvider,
    navigateToProblem
  } = useEditorStore();

  const handleProblemChange = (problemId: string) => {
    const problem = navigateToProblem(problemId);
    if (problem) {
      router.push(`/editor/${problem.slug}`);
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
