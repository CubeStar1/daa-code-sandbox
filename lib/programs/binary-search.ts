import type { Program } from "../types"

export const binarySearchProgram: Program = {
  id: "binary-search",
  name: "Binary Search",
  description: "Efficient search algorithm for sorted arrays that repeatedly divides the search space in half.",
  category: "Decrease and Conquer",
  examples: [
    {
      input: "5\n1 3 5 7 9\n5",
      output: "Element found at index 2",
      explanation: "In the sorted array [1, 3, 5, 7, 9], the target element 5 is found at index 2.",
    },
    {
      input: "6\n2 4 6 8 10 12\n7",
      output: "Element not found",
      explanation: "The element 7 is not present in the sorted array [2, 4, 6, 8, 10, 12].",
    },
  ],
  algorithmSteps: [
    "Initialize left and right pointers to array bounds",
    "Calculate middle index as (left + right) / 2",
    "Compare target with middle element",
    "If target equals middle, return the index",
    "If target is less than middle, search left half",
    "If target is greater than middle, search right half",
    "Repeat until element is found or search space is empty",
  ],
  keyProperties: [
    "Requires sorted input array",
    "Logarithmic time complexity O(log n)",
    "Divide-and-conquer approach",
    "Much faster than linear search for large datasets",
    "Can be implemented recursively or iteratively",
  ],
  timeComplexity: {
    best: "O(1)",
    average: "O(log n)",
    worst: "O(log n)",
    space: "O(log n)",
    analysis: `
# Time Complexity Analysis

## Algorithm Overview

Binary Search uses a **divide-and-conquer** approach that repeatedly divides the search space in half by comparing the target with the middle element.

## Complexity Summary

| Case | Time Complexity | Description |
|------|----------------|-------------|
| **Best** | O(1) | Target at middle position |
| **Average** | O(log n) | Target anywhere in array |
| **Worst** | O(log n) | Target not found or at boundary |

**Space Complexity:** O(log n) for recursive, O(1) for iterative

## Detailed Analysis

### Time Complexity: O(log n)

- Each iteration **eliminates half** of the remaining elements
- Maximum iterations needed: **⌈log₂ n⌉**
- Each iteration performs constant work: O(1)

### Mathematical Derivation

**Recurrence Relation:**

T(n) = T(n/2) + O(1)


**Solving the Recurrence:**

T(n) = T(n/2) + c
     = T(n/4) + 2c  
     = T(n/8) + 3c
     = ...
     = T(1) + c⋅log₂ n = O(log n)

### Case Analysis

- **Best Case (O(1)):** Target is at the middle position
- **Average Case (O(log n)):** Target found after ~log₂ n comparisons  
- **Worst Case (O(log n)):** Target not in array, requires ⌈log₂ n⌉ comparisons

### Why It's Efficient

Binary search is much faster than linear search for large arrays:

| Array Size | Linear Search | Binary Search |
|------------|---------------|---------------|
| 1,000 | ~500 operations | ~10 operations |
| 1,000,000 | ~500,000 operations | ~20 operations |

> **Note:** Binary search requires the array to be sorted, but the logarithmic time complexity makes it very efficient for large datasets.
    `,
  },
  code: `#include <stdio.h>

int binarySearch(int arr[], int l, int r, int x) {
    if (r >= l) {
        int mid = l + (r - l) / 2;
        
        if (arr[mid] == x)
            return mid;
        
        if (arr[mid] > x)
            return binarySearch(arr, l, mid - 1, x);
        
        return binarySearch(arr, mid + 1, r, x);
    }
    
    return -1;
}

int main() {
    int n, x;
    printf("Enter number of elements: ");
    scanf("%d", &n);
    
    int arr[n];
    printf("Enter %d sorted elements: ", n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    printf("Enter element to search: ");
    scanf("%d", &x);
    
    int result = binarySearch(arr, 0, n - 1, x);
    
    if (result == -1)
        printf("Element not found\\n");
    else
        printf("Element found at index %d\\n", result);
    
    return 0;
}`,
}
