"use client";

import React from 'react';
import { ProgramSelector } from "@/components/program-selector";
import { ProviderInfoPopover } from "@/components/provider-info-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Program } from "@/lib/types";

interface MobileNavbarProps {
  programs: Program[];
  selectedProgram: Program;
  onProgramChange: (programId: string) => void;
  executionProvider: 'judge0' | 'onecompiler';
  onExecutionProviderChange: (value: 'judge0' | 'onecompiler') => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({
  programs,
  selectedProgram,
  onProgramChange,
  executionProvider,
  onExecutionProviderChange
}) => {
  return (
    <div className="bg-background sticky top-0 z-50 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <ProgramSelector
            programs={programs}
            selectedProgram={selectedProgram}
            onProgramChange={onProgramChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <ProviderInfoPopover 
            executionProvider={executionProvider}
            onExecutionProviderChange={onExecutionProviderChange}
          />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
