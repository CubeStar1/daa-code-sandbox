import type { ProgrammingLanguage } from '@/lib/database-types'

// Starter code templates
const starterCodeTemplates: Record<ProgrammingLanguage, string> = {
  'c': `#include <stdio.h>

int main() {
    // Your code here
    printf("Hello, World!\\n");
    return 0;
}`,
  'cpp': `#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  'java': `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`,
  'python': `# Your code here
print("Hello, World!")`,
  'javascript': `// Your code here
console.log("Hello, World!");`,
  'typescript': `// Your code here
console.log("Hello, World!");`,
  'go': `package main

import "fmt"

func main() {
    // Your code here
    fmt.Println("Hello, World!")
}`,
  'rust': `fn main() {
    // Your code here
    println!("Hello, World!");
}`,
  'c#': `using System;

class Program {
    static void Main() {
        // Your code here
        Console.WriteLine("Hello, World!");
    }
}`
}

export function getStarterCode(language: ProgrammingLanguage): string {
  return starterCodeTemplates[language] || starterCodeTemplates['python']
}
