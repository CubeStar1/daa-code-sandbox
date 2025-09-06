"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExecutionProviderSelectorProps {
  executionProvider: 'judge0' | 'onecompiler';
  onExecutionProviderChange: (value: 'judge0' | 'onecompiler') => void;
  className?: string;
}

export const ExecutionProviderSelector: React.FC<ExecutionProviderSelectorProps> = ({
  executionProvider,
  onExecutionProviderChange,
  className = "",
}) => {
  return (
    <Select 
      value={executionProvider} 
      onValueChange={onExecutionProviderChange}
    >
      <SelectTrigger className={`w-full md:w-full ${className}`}>
        <SelectValue placeholder="Select Provider" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="onecompiler">OneCompiler</SelectItem>
        <SelectItem value="judge0">Judge0</SelectItem>
      </SelectContent>
    </Select>
  );
};
