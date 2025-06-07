"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <Card className="h-full border-0 shadow-none flex flex-col">
      <CardHeader className="flex-shrink-0 px-4">
        <CardTitle className="text-lg">Time Complexity Analysis</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-4 py-0">
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-4 pr-4">
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
      </CardContent>
    </Card>
  )
}
