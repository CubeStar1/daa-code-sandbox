import type { Program } from "../types"

export const heapSortProgram: Program = {
  id: "heap-sort",
  name: "Heap Sort",
  description:
    "A comparison-based sorting algorithm that uses a binary heap data structure. It first transforms the input array into a max heap, then repeatedly extracts the maximum element from the heap and places it at the end of the sorted portion of the array.",
  category: "Transform and Conquer",
  examples: [
    {
      input: "5\n12 11 13 5 6",
      output: "Sorted array is \n5 6 11 12 13 \n",
      explanation: "The array is transformed into a max heap, and elements are extracted one by one to sort it.",
    },
    {
      input: "7\n64 34 25 12 22 11 90",
      output: "Sorted array is \n11 12 22 25 34 64 90 \n",
      explanation: "Heap sort arranges the elements [64, 34, 25, 12, 22, 11, 90] into ascending order.",
    },
  ],
  algorithmSteps: [
    "Build a max heap from the input array. This involves arranging the array elements to satisfy the heap property (parent nodes are greater than or equal to their children). This can be done in O(n) time, typically by calling a 'heapify' procedure for non-leaf nodes starting from the last non-leaf node up to the root.",
    "Repeat n-1 times (where n is the number of elements):",
    "  Swap the root element (the largest element in the heap) with the last element of the current heap.",
    "  Reduce the size of the heap by one (effectively moving the largest element to its sorted position at the end of the array).",
    "  Call 'heapify' on the root of the reduced heap to restore the max heap property.",
    "The array is now sorted.",
  ],
  keyProperties: [
    "In-place sorting algorithm (requires O(1) auxiliary space, or O(log n) for recursion stack if heapify is recursive).",
    "Comparison-based sort.",
    "Time complexity is O(n log n) for all cases (best, average, worst).",
    "Not a stable sort (does not preserve the relative order of equal elements).",
    "Good for situations where space is a concern and guaranteed O(n log n) performance is needed.",
  ],
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1) auxiliary if heapify is iterative, O(log n) for recursive heapify stack.",
    analysis: `
# Time Complexity Analysis for Heap Sort

## Algorithm Overview

Heap Sort is a comparison-based sorting technique based on a Binary Heap data structure. It's typically done in two phases:
1.  **Heap Construction:** Build a max heap from the input data. The largest element is at the root.
2.  **Sortdown Phase:** Repeatedly extract the maximum element from the heap (which is the root) and move it to its sorted position at the end of the array. Then, heapify the remaining elements to maintain the heap property.

## Complexity Summary

| Case      | Time Complexity | Space Complexity (Auxiliary) |
|-----------|-----------------|------------------------------|
| **Best**  | O(n log n)      | O(1) or O(log n)             |
| **Average**| O(n log n)      | O(1) or O(log n)             |
| **Worst** | O(n log n)      | O(1) or O(log n)             |

## Detailed Analysis

### Time Complexity: O(n log n)

-   **Building the Heap (Heapify Phase):**
    The process of converting an array of n elements into a max heap takes **O(n)** time. This might seem counter-intuitive as it involves calling \\\`heapify\\\` (which is O(log n)) for n/2 elements. However, a tighter analysis shows that the sum of heights of nodes is linear, leading to an O(n) build time.

-   **Extracting Elements (Sortdown Phase):**
    This phase involves n-1 extractions. For each extraction:
    1.  The root (max element) is swapped with the last element of the current heap.
    2.  The heap size is reduced by one.
    3.  \\\`heapify\\\` is called on the new root to restore the heap property. This \\\`heapify\\\` operation takes **O(log k)** time, where k is the current size of the heap.
    This is repeated n-1 times. So, the total time for this phase is the sum of O(log n) + O(log(n-1)) + ... + O(log 2), which is **O(n log n)**.

-   **Total Time Complexity:**
    The overall time complexity is O(n) (for heap construction) + O(n log n) (for extractions) = **O(n log n)**.

### Space Complexity: O(1) or O(log n)

-   Heap sort is an **in-place** algorithm, meaning it sorts the array using a constant amount of extra storage, **O(1)**, if the \\\`heapify\\\` operation is implemented iteratively.
-   If \\\`heapify\\\` is implemented recursively (as in the provided C example), it will use space on the call stack. The maximum depth of recursion for \\\`heapify\\\` is proportional to the height of the heap, which is **O(log n)**. So, in this case, the space complexity is O(log n).

## Algorithm Properties

### Advantages
-   **Efficient Time Complexity:** O(n log n) in all cases (best, average, worst), making it reliable.
-   **Space Efficiency:** In-place (O(1) auxiliary space if iterative heapify, O(log n) for recursive).

### Disadvantages
-   **Not Stable:** Does not preserve the relative order of equal elements.
-   **Not Adaptive:** Does not take advantage of already sorted or partially sorted data.
-   **Slower in Practice (on average) than Quick Sort:** While having a better worst-case complexity than Quick Sort, Heap Sort often has larger constant factors and can be slower on typical inputs due to less cache-friendly memory access patterns.

## Comparison with Other Sorting Algorithms

| Algorithm    | Best Case   | Average Case | Worst Case | Space (Auxiliary) | Stable |
|--------------|-------------|--------------|------------|-------------------|--------|
| **Heap Sort**| O(n log n)  | O(n log n)   | O(n log n) | O(1) / O(log n)   | ✗      |
| Merge Sort   | O(n log n)  | O(n log n)   | O(n log n) | O(n)              | ✓      |
| Quick Sort   | O(n log n)  | O(n log n)   | O(n²)      | O(log n)          | ✗      |
    `,
  },
  code: `
#include <stdio.h>

void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest])
        largest = l;

    if (r < n && arr[r] > arr[largest])
        largest = r;

    if (largest != i) {
        int swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}

void printArray(int arr[], int n) {
    for (int i = 0; i < n; ++i)
        printf("%d ", arr[i]);
    printf("\\n");
}

int main() {
    int n;
    printf("Enter number of elements: \\n");
    scanf("%d", &n);

    if (n <= 0) {
        printf("Number of elements must be positive.\\n");
        return 1;
    }

    int arr[n];
    printf("Enter %d integers: \\n", n);
    for (int i = 0; i < n; ++i)
        scanf("%d", &arr[i]);

    heapSort(arr, n);

    printf("Sorted array is \\n");
    printArray(arr, n);
    return 0;
}
`,
sampleInput: "5\n12 11 13 5 6"
}
