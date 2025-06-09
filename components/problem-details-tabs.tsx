"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramDescription } from "./program-description";
import { ComplexityAnalysis } from "./complexity-analysis";
import type { Program } from "@/lib/types";

interface ProblemDetailsTabsProps {
  program: Program;
}

export function ProblemDetailsTabs({ program }: ProblemDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="h-full flex flex-col bg-card rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex-shrink-0 border-b border-border p-2 dark:bg-[#333333]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="complexity">Complexity</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="description" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
          <ProgramDescription program={program} />
        </TabsContent>
        <TabsContent value="complexity" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
          <ComplexityAnalysis program={program} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
