import type { Program } from "../types"

export const mergeSortProgram: Program = {
  id: "merge-sort",
  name: "Merge Sort",
  description:
    "Efficient divide-and-conquer sorting algorithm that recursively divides the array and merges sorted subarrays.",
  category: "Divide and Conquer",
  examples: [
    {
      input: "6\n64 34 25 12 22 11",
      output: "11 12 22 25 34 64",
      explanation:
        "The array [64, 34, 25, 12, 22, 11] is recursively divided and merged to produce the sorted array [11, 12, 22, 25, 34, 64].",
    },
    {
      input: "4\n5 2 8 1",
      output: "1 2 5 8",
      explanation: "Merge sort divides [5, 2, 8, 1] into [5, 2] and [8, 1], sorts each half, then merges them.",
    },
  ],
  algorithmSteps: [
    "Divide the array into two halves",
    "Recursively sort the left half",
    "Recursively sort the right half",
    "Merge the two sorted halves",
    "Compare elements from both halves",
    "Place smaller element in result array",
    "Continue until all elements are merged",
  ],
  keyProperties: [
    "Stable sorting algorithm",
    "Guaranteed O(n log n) performance",
    "Divide-and-conquer approach",
    "Not in-place (requires extra space)",
    "Predictable performance regardless of input",
    "Good for large datasets",
  ],
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    analysis: `
# Time Complexity Analysis

## Algorithm Overview

Merge Sort is a **divide-and-conquer** algorithm that recursively divides the array into halves, sorts them, and merges the results.

## Complexity Summary

| Case | Time Complexity | Space Complexity |
|------|----------------|------------------|
| **Best** | O(n log n) | O(n) |
| **Average** | O(n log n) | O(n) |
| **Worst** | O(n log n) | O(n) |

## Detailed Analysis

### Time Complexity: O(n log n)

- **Dividing:** O(log n) levels of recursion
- **Merging:** O(n) operations at each level  
- **Total:** O(n log n)

### Space Complexity: O(n)

- **Temporary arrays** for merging: O(n) space
- **Recursion stack:** O(log n) space
- **Total:** O(n)

## Mathematical Derivation

### Recurrence Relation

The time complexity can be expressed as:


T(n) = 2T(n/2) + O(n)


Where:
- 2T(n/2): Time to sort two halves
- O(n): Time to merge the sorted halves

### Master Theorem Solution

Using the **Master Theorem**:
- a = 2, b = 2, f(n) = n
- log₂(2) = 1
- f(n) = n = Θ(n¹)
- Since f(n) = Θ(n^log_b(a)), we have **Case 2**
- Therefore: **T(n) = Θ(n log n)**

### Step-by-step Expansion

T(n) = 2T(n/2) + cn
     = 2[2T(n/4) + c(n/2)] + cn
     = 4T(n/4) + cn + cn
     = 4T(n/4) + 2cn
     = 8T(n/8) + 3cn
     = ...
     = 2^k T(n/2^k) + kcn

When n/2^k = 1, then k = log₂ n


T(n) = n⋅T(1) + cn⋅log₂ n = O(n log n)


## Algorithm Properties

### Advantages
- **Stable:** Equal elements maintain relative order
- **Consistent:** Always O(n log n) regardless of input
- **Predictable:** No worst-case degradation

### Disadvantages  
- **Not in-place:** Requires O(n) extra space
- **Overhead:** Recursive calls and array copying

## Comparison with Other Sorting Algorithms

| Algorithm | Best Case | Average Case | Worst Case | Space | Stable |
|-----------|-----------|--------------|------------|-------|--------|
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✓ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ✗ |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ✗ |
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✓ |

> **Note:** Merge Sort is the only comparison-based sort that guarantees O(n log n) performance in all cases while maintaining stability.
    `,
  },
  code: `#include <stdio.h>
#include <stdlib.h>   

void merge(int a[], int l, int m, int r)
{
    int n1 = m - l + 1;      
    int n2 = r - m;          
    int *left  = (int*)malloc(n1 * sizeof(int));
    int *right = (int*)malloc(n2 * sizeof(int));

    for (int i = 0; i < n1; ++i) left[i]  = a[l + i];
    for (int j = 0; j < n2; ++j) right[j] = a[m + 1 + j];

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2)
        a[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];

    while (i < n1) a[k++] = left[i++];   
    while (j < n2) a[k++] = right[j++];  

    free(left);
    free(right);
}

void mergeSort(int a[], int l, int r)
{
    if (l >= r) return;                 
    int m = l + (r - l) / 2;            
    mergeSort(a, l, m);                 
    mergeSort(a, m + 1, r);             
    merge(a, l, m, r);                  
}

int main(void)
{
    int n;
    printf("Enter number of elements: ");
    scanf("%d", &n);

    int arr[n];
    printf("Enter %d integers: \\n", n);
    for (int i = 0; i < n; ++i) scanf("%d", &arr[i]);

    mergeSort(arr, 0, n - 1);

    printf("Sorted array:\\n");
    for (int i = 0; i < n; ++i) printf("%d ", arr[i]);
    putchar('\\n');
    return 0;
}
`,
}
