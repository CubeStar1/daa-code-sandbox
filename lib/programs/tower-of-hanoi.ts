import type { Program } from "../types"

export const towerOfHanoiProgram: Program = {
  id: "tower-of-hanoi",
  name: "Tower of Hanoi",
  description:
    "A mathematical puzzle where the objective is to move an entire stack of disks from one rod to another, obeying specific rules.",
  category: "Recursive",
  examples: [
    {
      input: "3",
      output: "Move disk 1 from A -> C\nMove disk 2 from A -> B\nMove disk 1 from C -> B\nMove disk 3 from A -> C\nMove disk 1 from B -> A\nMove disk 2 from B -> C\nMove disk 1 from A -> C",
      explanation:
        "Steps to move 3 disks from source rod A to destination rod C using auxiliary rod B.",
    },
  ],
  algorithmSteps: [
    "If only one disk, move it from source to destination.",
    "Move n-1 disks from source to auxiliary rod, using destination as temporary.",
    "Move the nth disk from source to destination rod.",
    "Move the n-1 disks from auxiliary rod to destination rod, using source as temporary.",
  ],
  keyProperties: [
    "Recursive algorithm",
    "Optimal solution takes 2^n - 1 moves for n disks",
    "Demonstrates the power of recursion for problem-solving",
  ],
  timeComplexity: {
    best: "O(2^n)",
    average: "O(2^n)",
    worst: "O(2^n)",
    space: "O(n) for recursion stack",
    analysis: `
# Time Complexity Analysis

## Algorithm Overview

The Tower of Hanoi is solved using a recursive approach. To move n disks from a source rod to a destination rod, we:
1. Move n-1 disks from source to auxiliary.
2. Move the nth disk from source to destination.
3. Move n-1 disks from auxiliary to destination.

## Complexity Summary

| Case      | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| **All**   | O(2^n)          | O(n)             |

## Detailed Analysis

### Time Complexity: O(2^n)

The number of moves M(n) required to solve the puzzle with n disks can be defined by the recurrence relation:

M(n) = 2 * M(n-1) + 1

With the base case M(1) = 1.

Expanding this:
M(n) = 2(2M(n-2) + 1) + 1 = 2^2 M(n-2) + 2 + 1
M(n) = 2^k M(n-k) + (2^(k-1) + ... + 2^1 + 2^0)

Let n-k = 1, so k = n-1.
M(n) = 2^(n-1) M(1) + (2^(n-1) - 1)
M(n) = 2^(n-1) * 1 + 2^(n-1) - 1
M(n) = 2 * 2^(n-1) - 1
M(n) = 2^n - 1

Thus, the time complexity is exponential, O(2^n), as each disk added roughly doubles the number of moves.

### Space Complexity: O(n)

The space complexity is determined by the maximum depth of the recursion stack. Since the function calls itself for n-1 disks, the maximum depth of the stack will be n. Therefore, the space complexity is O(n).
    `,
  },
  code: {
    c: `
#include <stdio.h>

void hanoi(int n, char src, char aux, char dest)
{
    if (n == 0) return;

    hanoi(n - 1, src, dest, aux);
    printf("Move disk %d from %c -> %c\\n", n, src, dest);
    hanoi(n - 1, aux, src, dest);
}

int main(void)
{
    int disks;
    printf("Enter number of disks for Tower of Hanoi: \\n");
    scanf("%d", &disks);
    printf("Steps to solve Tower of Hanoi with %d disks:\\n", disks);
    hanoi(disks, 'A', 'B', 'C');

    return 0;
}
`,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

void hanoi(int n, char src, char aux, char dest) {
    if (n == 0) return;

    hanoi(n - 1, src, dest, aux);
    cout << "Move disk " << n << " from " << src << " -> " << dest << endl;
    hanoi(n - 1, aux, src, dest);
}

int main() {
    int disks;
    cout << "Enter number of disks for Tower of Hanoi: " << endl;
    cin >> disks;
    cout << "Steps to solve Tower of Hanoi with " << disks << " disks:" << endl;
    hanoi(disks, 'A', 'B', 'C');
    return 0;
}
`
  },
  sampleInput: "3"
}

