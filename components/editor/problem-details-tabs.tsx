"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemDescription } from "./problem-description";
import { ComplexityAnalysis } from "./complexity-analysis";
import type { Problem } from "@/lib/database-types";

interface ProblemDetailsTabsProps {
  problem: Problem;
}

export function ProblemDetailsTabs({ problem }: ProblemDetailsTabsProps) {
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
          <ProblemDescription problem={problem} />
        </TabsContent>
        <TabsContent value="complexity" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
          <ComplexityAnalysis problem={problem} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
