export interface Program {
  id: string
  name: string
  description: string
  category:
    | "Brute Force"
    | "Recursive"
    | "Divide and Conquer"
    | "Decrease and Conquer"
    | "Transform and Conquer"
    | "Space and Time Tradeoffs"
    | "Dynamic Programming"
    | "Greedy Technique"
    | "Backtracking"
    | "Branch and Bound"
  examples: {
    input: string
    output: string
    explanation: string
  }[]
  algorithmSteps: string[]
  keyProperties: string[]
  timeComplexity: {
    best: string
    average: string
    worst: string
    space: string
    analysis: string
  }
  code: string
}

export interface ExecutionResult {
  output: string
  time?: number
  memory?: number
  error?: string
}

export interface ExecutionStats {
  time?: number
  memory?: number
}
