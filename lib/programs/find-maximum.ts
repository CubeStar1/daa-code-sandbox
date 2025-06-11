import type { Program } from "../types"

export const findMaximumProgram: Program = {
  id: "find-maximum",
  name: "Find Maximum Number",
  description: "Find the maximum number from a list of integers using a simple linear search approach.",
  category: "Brute Force",
  examples: [
    {
      input: "5\n1 3 7 2 9",
      output: "9",
      explanation: "Among the numbers [1, 3, 7, 2, 9], the maximum value is 9.",
    },
    {
      input: "3\n-5 -2 -8",
      output: "-2",
      explanation: "Among negative numbers [-5, -2, -8], the maximum (least negative) is -2.",
    },
  ],
  algorithmSteps: [
    "Read the number of elements from user input",
    "Initialize the first element as the current maximum",
    "Iterate through remaining elements one by one",
    "Compare each element with the current maximum",
    "Update maximum if a larger element is found",
    "Return the final maximum value",
  ],
  keyProperties: [
    "Linear time complexity O(n)",
    "Constant space complexity O(1)",
    "Single pass through the array",
    "Optimal for unsorted arrays",
    "Simple and intuitive algorithm",
  ],
  timeComplexity: {
    best: "O(n)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
    analysis: `
# Time Complexity Analysis

## Algorithm Overview

This algorithm finds the maximum element in an array by **iterating through all elements once** using a simple linear scan approach.

## Complexity Summary

| Case | Time Complexity | Space Complexity |
|------|----------------|------------------|
| **Best** | O(n) | O(1) |
| **Average** | O(n) | O(1) |
| **Worst** | O(n) | O(1) |

## Detailed Analysis

### Time Complexity: O(n)

- We iterate through the array **exactly once**
- Each comparison operation takes **O(1)** time
- Total operations: **n-1 comparisons**
- Therefore: **T(n) = O(n)**

### Space Complexity: O(1)

- We only use a **constant amount** of extra space
- Variables: max, i (constant space regardless of input size)

## Mathematical Derivation

### All Cases: O(n)

| Case | Operations | Explanation |
|------|------------|-------------|
| **Best** | n-1 comparisons | Even if first element is maximum, must check all |
| **Average** | n-1 comparisons | Always need to examine every element |
| **Worst** | n-1 comparisons | Maximum at end, all comparisons needed |

### Recurrence Relation

T(n) = T(n-1) + O(1) = O(n)


Or more simply:
  
T(n) = c × (n-1) = O(n)


Where **c** is the constant time for each comparison.

## Why This Algorithm is Optimal

> Any algorithm that finds the maximum element must examine each element at least once, since the maximum could be any element in the array.

- **Lower bound:** Ω(n)
- **Our algorithm:** O(n)
- **Therefore:** This algorithm is **optimal**

## Algorithm Properties

- **Simple implementation** - easy to understand and code
- **Cache-friendly** - sequential memory access pattern
- **Optimal time complexity** - cannot be improved asymptotically
- **Minimal space usage** - only uses constant extra space
    `,
  },
  code: {
    c: `
#include <stdio.h>

int main(void)
{
    int n;          
    int num;        
    int max;        
    int i;          

    printf("Enter how many numbers: \\n");
    scanf("%d", &n);

    if (n <= 0) {                 
        printf("Nothing to compare!\\n");
        return 0;
    }

    printf("Enter number 1: \\n");
    scanf("%d", &num);
    max = num;

    for (i = 2; i <= n; ++i) {
        printf("Enter number %d: \\n", i);
        scanf("%d", &num);

        if (num > max) {          
            max = num;
        }
    }

    printf("Maximum = %d\\n", max);
    return 0;
}
`,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter how many numbers: " << endl;
    cin >> n;

    if (n <= 0) {
        cout << "Nothing to compare!" << endl;
        return 0;
    }

    vector<int> nums(n);
    cout << "Enter " << n << " numbers: " << endl;
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
    }

    int max_val = nums[0];
    for (int i = 1; i < n; ++i) {
        if (nums[i] > max_val) {
            max_val = nums[i];
        }
    }

    cout << "Maximum = " << max_val << endl;

    return 0;
}
`
  },
  sampleInput: "5\n1 3 7 2 9",
}
