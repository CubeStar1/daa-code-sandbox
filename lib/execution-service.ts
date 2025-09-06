import type { ProgrammingLanguage } from "./database-types"

export interface ExecutionResult {
  output: string
  error?: string
  isRateLimited?: boolean
  time?: string
  memory?: string
  status?: 'success' | 'error' | 'timeout'
  executionTime?: number
}

// Language mapping for different execution providers
const getLanguageId = (language: ProgrammingLanguage, provider: 'judge0' | 'onecompiler'): string | number => {
  if (provider === 'judge0') {
    // Judge0 language IDs
    const judge0Map: Record<ProgrammingLanguage, number> = {
      'c': 50,           // C (GCC 9.2.0)
      'cpp': 54,         // C++ (GCC 9.2.0)
      'java': 62,        // Java (OpenJDK 13.0.1)
      'python': 71,      // Python (3.8.1)
      'javascript': 63,  // JavaScript (Node.js 12.14.0)
      'typescript': 74,  // TypeScript (3.7.4)
      'go': 60,          // Go (1.13.5)
      'rust': 73,        // Rust (1.40.0)
      'c#': 51           // C# (Mono 6.6.0.161)
    }
    return judge0Map[language] || 50
  } else {
    // OneCompiler language strings
    const oneCompilerMap: Record<ProgrammingLanguage, string> = {
      'c': 'c',
      'cpp': 'cpp',
      'java': 'java',
      'python': 'python',
      'javascript': 'nodejs',
      'typescript': 'typescript',
      'go': 'go',
      'rust': 'rust',
      'c#': 'csharp'
    }
    return oneCompilerMap[language] || 'c'
  }
}

export async function executeCode(
  code: string, 
  input: string = "", 
  language: ProgrammingLanguage = 'python',
  provider: 'judge0' | 'onecompiler' = 'onecompiler'
): Promise<ExecutionResult> {
  try {
    const apiUrl = `/api/execute?provider=${provider}`
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        code, 
        input, 
        language,
        languageId: getLanguageId(language, provider)
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Rate limit hit when calling /api/execute")
        return {
          output: "",
          error: "You've made too many requests in a short period. Please wait 60 seconds and try again.",
          isRateLimited: true,
          status: 'error'
        }
      }
      
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`)
    }

    const result = await response.json()
    return {
      ...result,
      status: result.error ? 'error' : 'success'
    }
  } catch (error) {
    return {
      output: `Network Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 'error'
    }
  }
}

// Get default starter code for each language
export const getStarterCode = (language: ProgrammingLanguage): string => {
  const starterCodes: Record<ProgrammingLanguage, string> = {
    'c': `#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello, World!\\n");
    return 0;
}`,
    'cpp': `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
    'java': `public class Main {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}`,
    'python': `# Write your code here
def solution():
    pass

if __name__ == "__main__":
    solution()`,
    'javascript': `// Write your code here
function solution() {
    console.log("Hello, World!");
}

solution();`,
    'typescript': `// Write your code here
function solution(): void {
    console.log("Hello, World!");
}

solution();`,
    'go': `package main

import "fmt"

func main() {
    // Write your code here
    fmt.Println("Hello, World!")
}`,
    'rust': `fn main() {
    // Write your code here
    println!("Hello, World!");
}`,
    'c#': `using System;

class Program {
    static void Main() {
        // Write your code here
        Console.WriteLine("Hello, World!");
    }
}`
  }
  
  return starterCodes[language] || starterCodes['cpp']
}
