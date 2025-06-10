import type { Program } from "../types"

export const quickSortProgram: Program = {
  id: "quick-sort",
  name: "Quick Sort",
  description:
    "An efficient, in-place sorting algorithm that uses a divide-and-conquer strategy to pick an element as a pivot and partition the array around the pivot.",
  category: "Divide and Conquer",
  examples: [
    {
      input: "6\n64 34 25 12 22 11",
      output: "11 12 22 25 34 64",
      explanation:
        "The array [64, 34, 25, 12, 22, 11] is sorted using Quick Sort.",
    },
    {
      input: "5\n10 80 30 90 40",
      output: "10 30 40 80 90",
      explanation: "Quick Sort partitions and sorts the array [10, 80, 30, 90, 40].",
    },
  ],
  algorithmSteps: [
    "Choose a pivot element from the array.",
    "Partition the array: reorder the array so that all elements with values less than the pivot come before the pivot, while all elements with values greater than the pivot come after it.",
    "After partitioning, the pivot is in its final sorted position.",
    "Recursively apply the above steps to the sub-array of elements with smaller values and separately to the sub-array of elements with greater values.",
  ],
  keyProperties: [
    "Divide-and-conquer algorithm",
    "In-place sorting (typically O(log n) space for recursion stack)",
    "Average time complexity is O(n log n)",
    "Worst-case time complexity is O(n^2) (e.g., for already sorted or reverse sorted arrays with naive pivot selection)",
    "Not stable by default",
    "Generally faster in practice than Merge Sort and Heap Sort for many inputs",
  ],
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n^2)",
    space: "O(log n) average, O(n) worst-case (recursion stack)",
    analysis: `
# Time Complexity Analysis for Quick Sort

## Algorithm Overview

Quick Sort is a **divide-and-conquer** algorithm. It works by selecting a 'pivot' element from the array and partitioning the other elements into two sub-arrays, according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively.

## Complexity Summary

| Case      | Time Complexity | Space Complexity (Recursion Stack) |
|-----------|-----------------|------------------------------------|
| **Best**  | O(n log n)      | O(log n)                           |
| **Average**| O(n log n)      | O(log n)                           |
| **Worst** | O(n²)           | O(n)                               |

## Detailed Analysis

### Time Complexity

-   **Best Case: O(n log n)**
    This occurs when the pivot element always divides the array into two nearly equal halves. The recurrence relation is:
    T(n) = 2T(n/2) + O(n)
    Solving this (e.g., using the Master Theorem) gives O(n log n).

-   **Average Case: O(n log n)**
    Even if the pivot doesn't divide the array perfectly, as long as the split is reasonably balanced on average, the complexity remains O(n log n). Rigorous analysis involves more complex mathematics but confirms this average behavior.

-   **Worst Case: O(n²)**
    This occurs when the pivot element is consistently the smallest or largest element in the (sub)array (e.g., an already sorted array, or a reverse-sorted array, if the first or last element is chosen as pivot without randomization). The recurrence relation becomes:
    T(n) = T(n-1) + O(n)
    This sums up to O(n²).

### Space Complexity

The space complexity is determined by the depth of the recursion stack.

-   **Best Case & Average Case: O(log n)**
    When partitions are balanced, the recursion depth is O(log n).

-   **Worst Case: O(n)**
    In the worst-case scenario (unbalanced partitions), the recursion depth can go up to O(n).
    Some implementations can optimize tail recursion to limit space to O(log n) even in the worst case for one of the recursive calls, but the overall worst-case space for a naive recursive implementation is O(n).

## Pivot Selection

The choice of pivot significantly impacts performance:
-   **First/Last element:** Simple but prone to worst-case on sorted/reversed data.
-   **Random element:** Generally good, makes worst-case less likely on specific input orders.
-   **Median-of-three:** Choose the median of the first, middle, and last elements. More robust than simple first/last pivot.

## Algorithm Properties

### Advantages
-   **Efficient on average:** O(n log n) makes it very fast for typical inputs.
-   **In-place:** Sorts the array without requiring significant additional memory (apart from the recursion stack).

### Disadvantages
-   **Worst-case O(n²):** Performance degrades significantly on certain inputs if pivot selection is poor.
-   **Not stable:** Does not preserve the relative order of equal elements.
-   **Recursive:** Overhead of function calls.

## Comparison with Other Sorting Algorithms

| Algorithm    | Best Case   | Average Case | Worst Case | Space (Typical) | Stable |
|--------------|-------------|--------------|------------|-----------------|--------|
| **Quick Sort**| O(n log n)  | O(n log n)   | O(n²)      | O(log n)        | ✗      |
| Merge Sort   | O(n log n)  | O(n log n)   | O(n log n) | O(n)            | ✓      |
| Heap Sort    | O(n log n)  | O(n log n)   | O(n log n) | O(1)            | ✗      |

> **Note:** Despite its O(n²) worst case, Quick Sort is often faster in practice than Merge Sort and Heap Sort due to smaller constant factors and good cache performance when implemented well.
    `,
  },
  code: {
    c: `
#include <stdio.h>

void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);

    for (int j = low; j <= high - 1; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return (i + 1);
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

void printArray(int arr[], int size) {
    for (int i = 0; i < size; i++)
        printf("%d ", arr[i]);
    printf("\\n");
}

int main() {
    int n;
    printf("Enter number of elements: ");
    scanf("%d", &n);

    if (n <= 0) {
        printf("Invalid array size.\\n");
        return 1;
    }

    int arr[n];
    printf("Enter %d integers: \\n", n);
    for (int i = 0; i < n; ++i) scanf("%d", &arr[i]);

    quickSort(arr, 0, n - 1);
    printf("Sorted array: \\n");
    printArray(arr, n);
    return 0;
}
`,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);

    for (int j = low; j <= high - 1; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

void printArray(const vector<int>& arr) {
    for (int i = 0; i < arr.size(); i++)
        cout << arr[i] << " ";
    cout << endl;
}

int main() {
    int n;
    cout << "Enter number of elements: ";
    cin >> n;

    if (n <= 0) {
        cout << "Invalid array size." << endl;
        return 1;
    }

    vector<int> arr(n);
    cout << "Enter " << n << " integers: " << endl;
    for (int i = 0; i < n; ++i) {
        cin >> arr[i];
    }

    quickSort(arr, 0, n - 1);
    cout << "Sorted array: " << endl;
    printArray(arr);
    return 0;
}
`
  },
  sampleInput: "6\n64 34 25 12 22 11"
}
