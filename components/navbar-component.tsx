"use client";

import React from 'react';
import { ProgramSelector } from "@/components/program-selector";
import { ProviderInfoPopover } from "@/components/provider-info-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import TimerComponent from "@/components/timer-component"; // Adjusted path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import type { Program } from "@/lib/types";
import Image from "next/image";

interface NavbarComponentProps {
  programs: Program[];
  selectedProgram: Program;
  onProgramChange: (programId: string) => void;
  onNextProgram: () => void;
  onPreviousProgram: () => void;
  onRandomProgram: () => void;
  executionProvider: 'judge0' | 'onecompiler';
  onExecutionProviderChange: (value: 'judge0' | 'onecompiler') => void;
}

const NavbarComponent: React.FC<NavbarComponentProps> = ({
  programs,
  selectedProgram,
  onProgramChange,
  onNextProgram,
  onPreviousProgram,
  onRandomProgram,
  executionProvider,
  onExecutionProviderChange
}) => {
  return (
    <div className="bg-background sticky top-0 z-50">
            <div className="mx-2 pt-2 flex flex-row items-center gap-4">
        {/* Title Section */}
        <div className="w-auto self-center">
          <div className="flex items-center gap-2">
            <Image src="code-sandbox-logo.png" alt="CodeSandbox Logo" width={30} height={50} />
            <h1 className="text-xl font-bold">DAA Lab</h1>
          </div>
        </div>

        {/* Centering Group: ProgramSelector and ProviderSelect */}
        <div className="flex-1 flex flex-row justify-center items-center gap-x-4">
          {/* Program Selector Wrapper */}
          <div className="w-auto flex items-center">
            <TooltipProvider>
              <div className="flex items-center mr-2 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onPreviousProgram}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Previous Question (Ctrl + ←)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onNextProgram}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Next Question (Ctrl + →)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onRandomProgram}>
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Random Question (Ctrl + R)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <ProgramSelector
              className="" // ProgramSelector component handles responsive width internally
              programs={programs}
              selectedProgram={selectedProgram}
              onProgramChange={onProgramChange}
            />
          </div>

          {/* Provider Info Popover (now includes Provider Select) and Timer Group */}
          <div className="flex items-center gap-2">
            <ProviderInfoPopover 
              executionProvider={executionProvider}
              onExecutionProviderChange={onExecutionProviderChange}
            />
            {/* Timer Component Integration */}
            <div className="flex items-center">
                <TimerComponent />
            </div>
          </div>
        </div>

        {/* ThemeToggle Section (Far right on desktop) & Timer for mobile */}
        <div className="w-auto ml-auto flex items-center justify-end self-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default NavbarComponent;
