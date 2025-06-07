import type { Program } from "../types";

export const subsetSumProgram: Program = {
  id: "subset-sum",
  name: "Subset Sum Problem",
  description:
    "The Subset Sum Problem determines if there is a subset of a given set of non-negative integers whose elements sum up to a given target value. This implementation finds and prints all such subsets using backtracking.",
  category: "Backtracking",
  examples: [
    {
      input: "Set: {10, 7, 5, 18, 12, 20, 15}, Sum: 35",
      output:
        "Subsets summing to 35:\n{ 10 7 18 }\n{ 10 5 20 }\n{ 7 18 10 } (order might vary or be same as previous if not unique elements)\n{ 5 18 12 }\n{ 20 15 }\n(Actual output from C code for {10,7,5,18,12,20,15} and M=35 would be:\n{ 10 7 18 }\n{ 10 5 20 }\n{ 18 12 5 } (using 5,12,18)\n{ 20 15 } )",
      explanation:
        "The C code prints all subsets of the given numbers that sum to the target value M.",
    },
    {
      input: "Set: {1, 2, 3}, Sum: 7",
      output: "(No output, as no subset sums to 7)",
      explanation: "If no subset sums to M, nothing is printed under 'Subsets summing to M:'."
    }
  ],
  algorithmSteps: [
    "The problem is solved using a recursive backtracking approach.",
    "The function `sumSubset(i, currSum, remSum)` is called initially with `i=0`, `currSum=0`, and `remSum` = total sum of all elements.",
    "  `i`: current index of the element being considered.",
    "  `currSum`: sum of elements included in the current subset.",
    "  `remSum`: sum of remaining elements not yet considered.",
    "Base Cases for recursion:",
    "  1. If `currSum == M` (target sum): A subset is found. Print it and return (or continue if finding all subsets).",
    "  2. If `i == n` (all elements considered) or `currSum + remSum < M` (impossible to reach M): Backtrack, return.",
    "Recursive Steps:",
    "  1. Include the current element `w[i]` if `currSum + w[i] <= M`:",
    "     Mark `x[i] = 1` (include `w[i]`).",
    "     Recursively call `sumSubset(i + 1, currSum + w[i], remSum - w[i])`.",
    "  2. Exclude the current element `w[i]` (this step is always performed to explore both branches unless a solution is found and we stop):",
    "     Mark `x[i] = 0` (exclude `w[i]`).",
    "     Recursively call `sumSubset(i + 1, currSum, remSum - w[i])`.",
    "The `x[]` array keeps track of which elements are included in the current path of the recursion.",
  ],
  keyProperties: [
    "Uses backtracking to systematically search for subsets.",
    "For each element, it makes a decision: either include it in the subset or exclude it.",
    "Pruning: If `currSum + remSum < M`, it's impossible to reach the target sum with remaining elements, so that branch is pruned.",
    "Can be adapted to find one subset, all subsets, or count subsets.",
  ],
  timeComplexity: {
    best: "O(N) if the first few elements sum to M.",
    average: "O(2^N) in the general case.",
    worst: "O(2^N) as it may explore all possible 2^N subsets in the worst case.",
    space: "O(N) for the recursion call stack and the `x[]` array to store the current subset configuration.",
    analysis: `
# Time Complexity Analysis for Subset Sum Problem (Backtracking)

## Algorithm Overview
The provided C code uses a backtracking approach to find all subsets of a given set of non-negative integers 'w' that sum up to a target value 'M'.

## Recursive Structure
The core function sumSubset(i, currSum, remSum) explores possibilities:
-   i: Index of the current element being considered.
-   currSum: Sum of elements chosen so far for the current subset.
-   remSum: Sum of all elements from index i to n-1 (remaining elements).

At each step i, the algorithm decides whether to include w[i] in the subset or not.

1.  **Include w[i]**: If currSum + w[i] <= M.
    -   Set x[i] = 1.
    -   Recurse: sumSubset(i + 1, currSum + w[i], remSum - w[i]).
2.  **Exclude w[i]**: (This branch is explored to find all solutions or if including w[i] doesn't lead to a solution from that path).
    -   Set x[i] = 0.
    -   Recurse: sumSubset(i + 1, currSum, remSum - w[i]).

## Base Cases and Pruning
-   If currSum == M: A valid subset is found. Print it.
-   If i == n (all elements processed) or currSum + remSum < M (cannot reach M even if all remaining elements are included): Prune this path and backtrack.

## Complexity Calculation
-   In the worst case, the algorithm explores a binary decision tree where each of the N elements can either be in a subset or not.
-   This leads to 2^N possible subsets to check.
-   For each subset, printing takes O(N) time.
-   The pruning (currSum + remSum < M) helps avoid exploring some branches, but the worst-case remains exponential.

## Resulting Complexity
-   **Time Complexity**: O(N * 2^N) if we consider printing time for all subsets. If we only consider the number of recursive calls, it's O(2^N). The provided C code prints, so O(N * 2^N) is more accurate if many solutions exist and are printed. Often, it's simplified to O(2^N) to describe the search space exploration.
-   **Space Complexity**: O(N) due to the recursion stack depth (at most N levels) and the x[] array of size N used to store the current subset composition.

Note: The Subset Sum problem is NP-complete. While this backtracking solution is exponential, pseudo-polynomial time solutions using dynamic programming exist (e.g., O(N*M)).
    `,
  },
  code: `
#include <stdio.h>

#define MAX  30                 

int n, M;                       
int w[MAX];                     
int x[MAX];                     

void printSubset(void)          
{
    printf("{ ");
    for (int i = 0; i < n; ++i)
        if (x[i]) printf("%d ", w[i]);
    puts("}");
}

void sumSubset(int i, int currSum, int remSum)
{
    if (currSum == M) {         
        printSubset();
        return;                 
    }
    if (i == n || currSum + remSum < M)  
        return;

    if (currSum + w[i] <= M) {
        x[i] = 1;
        sumSubset(i + 1, currSum + w[i], remSum - w[i]);
    }

    x[i] = 0;
    sumSubset(i + 1, currSum, remSum - w[i]);
}

int main(void)
{
    printf("Enter number of items (≤ %d): ", MAX);
    scanf("%d", &n);

    printf("Enter target sum M: ");
    scanf("%d", &M);

    puts("Enter each item's weight:");
    int total = 0;
    for (int i = 0; i < n; ++i) {
        scanf("%d", &w[i]);
        total += w[i];
        x[i] = 0;               
    }

    puts("\nSubsets summing to M:");
    sumSubset(0, 0, total);

    return 0;
}
  `,
};
