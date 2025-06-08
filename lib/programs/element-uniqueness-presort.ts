import type { Program } from "../types"

export const elementUniquenessPresortProgram: Program = {
  id: "element-uniqueness-presort",
  name: "Element Uniqueness (Presorting)",
  description:
    "Checks if all elements in an array are unique by first sorting the array (presorting) and then linearly scanning for adjacent identical elements.",
  category: "Transform and Conquer",
  examples: [
    {
      input: "5\n10 20 30 40 50",
      output: "All elements are UNIQUE.",
      explanation: "After sorting, no adjacent elements are identical.",
    },
    {
      input: "6\n10 20 30 20 40 50",
      output: "Duplicates FOUND in the array.",
      explanation: "After sorting (10 20 20 30 40 50), the adjacent 20s indicate a duplicate.",
    },
    {
      input: "3\n7 7 7",
      output: "Duplicates FOUND in the array.",
      explanation: "The sorted array (7 7 7) has adjacent duplicates.",
    },
  ],
  algorithmSteps: [
    "Read the array of elements.",
    "Sort the array using an efficient sorting algorithm (e.g., `qsort` which is typically O(n log n)). This is the 'presort' or 'transform' step.",
    "Iterate through the sorted array from the second element.",
    "Compare each element with its preceding element.",
    "If any adjacent elements are found to be identical, duplicates exist. Stop and report.",
    "If the loop completes without finding adjacent identical elements, all elements are unique.",
  ],
  keyProperties: [
    "Transform and Conquer strategy: The problem is transformed by sorting the array.",
    "Efficiency depends heavily on the sorting algorithm used.",
    "Simple to implement once sorting is available.",
    "Modifies the input array (due to sorting) unless a copy is made.",
  ],
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1) or O(log n) or O(n) for sorting, depending on `qsort` implementation. O(1) for the scan.",
    analysis: `
# Time Complexity Analysis for Element Uniqueness (Presorting)

## Algorithm Overview

The presorting approach to checking element uniqueness involves two main phases:
1.  **Transform Phase:** Sort the input array.
2.  **Conquer Phase:** Scan the sorted array for adjacent duplicates.

## Complexity Summary

| Case      | Time Complexity | Space Complexity (Excluding input array) |
|-----------|-----------------|------------------------------------------|
| **Best**  | O(n log n)      | O(1) to O(n) (dominated by sort)         |
| **Average**| O(n log n)      | O(1) to O(n) (dominated by sort)         |
| **Worst** | O(n log n)      | O(1) to O(n) (dominated by sort)         |

## Detailed Analysis

### Time Complexity: O(n log n)

-   **Sorting Step:** The dominant part of the algorithm is sorting the array. Standard library \\\`qsort\\\` (as used in the C code) typically has an average and worst-case time complexity of **O(n log n)**. Some implementations might achieve O(n log n) in the worst case (e.g., Introsort), while others might degrade to O(n²) for specific \\\`qsort\\\` versions or pivot strategies, though this is rare for good library implementations.
-   **Scanning Step:** After sorting, a single pass is made through the array to check for adjacent duplicates. This takes **O(n)** time.

Combining these, the total time complexity is governed by the sorting step: **O(n log n) + O(n) = O(n log n)**.

### Space Complexity

-   **Sorting Step:** The space complexity of \\\`qsort\\\` can vary:
    *   Some implementations (like those based on Introsort) are in-place and might use **O(log n)** space for the recursion stack.
    *   Other \\\`qsort\\\` implementations or sorting algorithms might use **O(n)** auxiliary space (e.g., Merge Sort if used by \\\`qsort\\\`).
    *   Truly in-place sorts like Heapsort would use **O(1)** auxiliary space (excluding input array storage).
    The C standard does not mandate a specific space complexity for \\\`qsort\\\` beyond modifying the input array.
-   **Scanning Step:** This step requires only a few variables for comparison, taking **O(1)** additional space.

Therefore, the overall auxiliary space complexity is dominated by the sorting algorithm, typically ranging from **O(1)** to **O(n)**.

## Comparison

-   **Brute Force:** Comparing every pair of elements takes O(n²).
-   **Hash Table:** Inserting elements into a hash table and checking for collisions takes O(n) on average (assuming good hash function and collision resolution), but O(n²) in the worst case for hash collisions. Requires O(n) space for the hash table.

The presorting method provides a good balance with O(n log n) time and potentially low auxiliary space.
    `,
  },
  code: `
#include <stdio.h>
#include <stdlib.h>

int cmpInt(const void *a, const void *b)
{
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int main(void)
{
    int n;
    printf("How many numbers? \\n");
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("Invalid size!\\n");
        return 0;
    }

    int arr[n];
    printf("Enter %d integers:\\n", n);
    for (int i = 0; i < n; ++i) scanf("%d", &arr[i]);

    qsort(arr, n, sizeof(int), cmpInt);

    int unique = 1;
    for (int i = 1; i < n; ++i) {
        if (arr[i] == arr[i - 1]) {
            unique = 0;
            break;
        }
    }

    if (unique)
        printf("All elements are UNIQUE.\\n");
    else
        printf("Duplicates FOUND in the array.\\n");

    return 0;
}
`,
sampleInput: "5\n10 20 30 40 50"
}

