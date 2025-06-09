"use client";

import React from 'react';
import { ProgramSelector } from "@/components/program-selector";
import { ProviderInfoPopover } from "@/components/provider-info-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import TimerComponent from "@/components/timer-component"; // Adjusted path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Program } from "@/lib/types";
import Image from "next/image";

interface NavbarComponentProps {
  programs: Program[];
  selectedProgram: Program;
  onProgramChange: (programId: string) => void;
  executionProvider: 'judge0' | 'onecompiler';
  onExecutionProviderChange: (value: 'judge0' | 'onecompiler') => void;
}

const NavbarComponent: React.FC<NavbarComponentProps> = ({
  programs,
  selectedProgram,
  onProgramChange,
  executionProvider,
  onExecutionProviderChange
}) => {
  return (
    <div className="bg-background sticky top-0 z-50">
      <div className="mx-2 pt-2 flex flex-col md:flex-row items-center gap-4">
        {/* Title Section */}
        <div className="w-full md:w-auto mb-2 md:mb-0 self-start md:self-center">
          <div className="flex items-center gap-2">
            <Image src="code-sandbox-logo.png" alt="CodeSandbox Logo" width={30} height={50} />
            <h1 className="text-xl font-bold">DAA Lab</h1>
          </div>
        </div>

        {/* Centering Group: ProgramSelector and ProviderSelect */}
        <div className="w-full md:flex-1 flex flex-col md:flex-row md:justify-center items-center gap-y-2 md:gap-x-4">
          {/* Program Selector Wrapper */}
          <div className="w-full md:w-auto mb-2 md:mb-0">
            <ProgramSelector
              className="" // ProgramSelector component handles responsive width internally
              programs={programs}
              selectedProgram={selectedProgram}
              onProgramChange={onProgramChange}
            />
          </div>

          {/* Provider Info Popover (now includes Provider Select) and Timer Group */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ProviderInfoPopover 
              executionProvider={executionProvider}
              onExecutionProviderChange={onExecutionProviderChange}
            />
            {/* Timer Component Integration */}
            <div className="hidden md:flex items-center">
                <TimerComponent />
            </div>
            <div className="block md:hidden ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* ThemeToggle Section (Far right on desktop) & Timer for mobile */}
        <div className="hidden md:flex w-full md:w-auto mt-2 md:mt-0 md:ml-auto items-center justify-end md:justify-start self-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default NavbarComponent;
