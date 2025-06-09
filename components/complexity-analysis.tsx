"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Markdown } from "@/components/ui/markdown"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Program } from "@/lib/types"

interface ComplexityAnalysisProps {
  program: Program
}

export function ComplexityAnalysis({ program }: ComplexityAnalysisProps) {
  return (
    <div className="h-full p-4">
      <h2 className="text-lg font-semibold mb-4">Time Complexity Analysis</h2>
      <ScrollArea className="h-[calc(100vh-17rem)] pr-2">
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead className="w-[250px]">Metric</TableHead>
                  <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                  <TableCell className="font-medium">Best Case Time Complexity</TableCell>
                  <TableCell>{program.timeComplexity.best}</TableCell>
              </TableRow>
              <TableRow>
                  <TableCell className="font-medium">Average Case Time Complexity</TableCell>
                  <TableCell>{program.timeComplexity.average}</TableCell>
              </TableRow>
              <TableRow>
                  <TableCell className="font-medium">Worst Case Time Complexity</TableCell>
                  <TableCell>{program.timeComplexity.worst}</TableCell>
              </TableRow>
              <TableRow>
                  <TableCell className="font-medium">Space Complexity</TableCell>
                  <TableCell>{program.timeComplexity.space}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

            <div className="border-t pt-4">
              <Markdown className="text-sm">{program.timeComplexity.analysis}</Markdown>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
