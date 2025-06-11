import type { Program } from "../types";

export const knapsackMemoizedProgram: Program = {
  id: "knapsack-memoized",
  name: "0/1 Knapsack (Memory Function)",
  description:
    "The 0/1 Knapsack problem solved using a memory function (memoization), which is a top-down dynamic programming approach. Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible. Each item can only be included once (0/1 property).",
  category: "Dynamic Programming",
  examples: [
    {
      input:
        "Values: 60 100 120\nWeights: 10 20 30\nNumber of items: 3\nKnapsack capacity: 50",
      output: "Maximum value: 220 (Items: 20wt/100val + 30wt/120val)",
      explanation:
        "The optimal solution picks the items with weights 20 and 30, for a total value of 100 + 120 = 220.",
    },
    {
      input:
        "Values: 10 40 30 50\nWeights: 5 4 6 3\nNumber of items: 4\nKnapsack capacity: 10",
      output: "Maximum value: 90 (Items: 4wt/40val + 3wt/50val)",
      explanation:
        "The items with weights 4 and 3 are chosen, yielding a total value of 40 + 50 = 90.",
    },
  ],
  algorithmSteps: [
    "Define a recursive function, say `knapsackRec(weights[], values[], index, capacity, memo[][])`.",
    "Base Cases:",
    "  If `capacity` < 0, return a very small number (negative infinity) as it's an invalid state.",
    "  If `index` < 0 or `capacity` == 0, return 0 (no items left or no capacity).",
    "Memoization Check:",
    "  If `memo[index][capacity]` is already computed (e.g., not -1), return its value.",
    "Recursive Step: For the current item `index`:",
    "  1. Option 1: Exclude the item. Recursively call `knapsackRec(..., index - 1, capacity, ...)`.",
    "  2. Option 2: Include the item (if `weights[index] <= capacity`). Recursively call `values[index] + knapsackRec(..., index - 1, capacity - weights[index], ...)`.",
    "Store and Return:",
    "  `memo[index][capacity] = max(Option 1, Option 2)`.",
    "  Return `memo[index][capacity]`.",
    "Initialize a 2D array `memo[n+1][W+1]` with -1 (or another indicator for 'not computed').",
    "Call the recursive function starting with the last item: `knapsackRec(weights, values, n-1, W, memo)`.",
  ],
  keyProperties: [
    "Solves the 0/1 Knapsack problem.",
    "Uses a top-down dynamic programming approach with memoization.",
    "Avoids recomputing results for the same subproblems by storing them.",
    "Time Complexity: O(N*W), where N is the number of items and W is the capacity.",
    "Space Complexity: O(N*W) for the memoization table and O(N) for recursion stack space in worst case.",
  ],
  timeComplexity: {
    best: "O(N*W)",
    average: "O(N*W)",
    worst: "O(N*W)",
    space: "O(N*W) for memo table + O(N) for recursion stack",
    analysis: `
# Time Complexity Analysis for 0/1 Knapsack (Memory Function)

## Algorithm Overview
The 0/1 Knapsack problem using a memory function (memoization) is a top-down dynamic programming technique. The goal is to maximize the total value of items that can be put into a knapsack of a given capacity, where each item has a weight and a value, and can either be fully included or not at all.

The recursive function explores two choices for each item:
1.  Include the item: If its weight is within the remaining capacity.
2.  Exclude the item.

Memoization is used to store the results of subproblems (defined by the current item index and remaining capacity) to avoid redundant computations.

## Recursive Relation
\\\\\\\`\\\\\\\`\\\\\\\`
Let dp[i][w] be the maximum value that can be obtained using items from index 0 to i with a knapsack capacity of w.

knapsack(index, capacity):
-   If index < 0 or capacity == 0, return 0.
-   If memo[index][capacity] is computed, return it.
-   If weights[index] > capacity:
    result = knapsack(index - 1, capacity)
-   Else:
    include_item = values[index] + knapsack(index - 1, capacity - weights[index])
    exclude_item = knapsack(index - 1, capacity)
    result = max(include_item, exclude_item)
-   memo[index][capacity] = result
-   Return result.
\\\\\\\`\\\\\\\`\\\\\\\`

## Complexity Calculation
-   **Subproblems:** The state of each subproblem is defined by \\\\\\\`(index, capacity)\\\\\\\`. There are \\\\\\\`N\\\\\\\` possible values for \\\\\\\`index\\\\\\\` (0 to N-1) and \\\\\\\`W\\\\\\\` possible values for \\\\\\\`capacity\\\\\\\` (0 to W).
    This gives a total of \\\\\\\`N * W\\\\\\\` distinct subproblems.

-   **Work per Subproblem:** Due to memoization, each subproblem \\\\\\\`knapsack(index, capacity)\\\\\\\` is computed only once. The work inside each call (excluding recursive calls that lead to already computed subproblems) involves a few comparisons, additions, and assignments, which takes constant time, O(1).

-   **Total Time:** Since there are \\\\\\\`N * W\\\\\\\` subproblems and each is solved once in O(1) time, the total time complexity is **O(N * W)**.

## Space Complexity
-   **Memoization Table:** A 2D array \\\\\\\`memo[N][W+1]\\\\\\\` (or \\\\\\\`memo[N+1][W+1]\\\\\\\`) is used to store the results of subproblems. This takes **O(N * W)** space.
-   **Recursion Stack:** In the worst case, the recursion depth can go up to \\\\\\\`N\\\\\\\` (e.g., when considering one item at a time and always choosing to exclude or include). This contributes **O(N)** to the space complexity for the call stack.

Therefore, the overall space complexity is dominated by the memoization table, resulting in **O(N * W)**.

## Comparison with Bottom-Up DP
-   **Time Complexity:** Same, O(N*W).
-   **Space Complexity:** Same, O(N*W) for the table. The bottom-up approach typically doesn't have the O(N) recursion stack overhead but might be optimized to use O(W) space if only the previous row's results are needed.
-   **Implementation:** Memoization (top-down) can sometimes be more intuitive to implement directly from a recursive formulation. Bottom-up DP requires figuring out the correct order of iteration.

*(N = number of items, W = knapsack capacity)*
    `,
  },
  code: {
    c: `
#include <stdio.h>

#define MAX 100
#define NIL -1

int dp[MAX][MAX];

int knapsack(int W, int wt[], int val[], int n) {
    if (n == 0 || W == 0)
        return 0;

    
    if (dp[n][W] != NIL)
        return dp[n][W];

    
    if (wt[n - 1] > W)
        return dp[n][W] = knapsack(W, wt, val, n - 1);

    int include = val[n - 1] + knapsack(W - wt[n - 1], wt, val, n - 1);
    int exclude = knapsack(W, wt, val, n - 1);

    return dp[n][W] = (include > exclude) ? include : exclude;
}

int main() {
    int val[] = {60, 100, 120};
    int wt[] = {10, 20, 30};
    int W = 50;       
    int n = sizeof(val) / sizeof(val[0]);

    for (int i = 0; i <= n; i++)
        for (int w = 0; w <= W; w++)
            dp[i][w] = NIL;

    int result = knapsack(W, wt, val, n);
    printf("Maximum value in Knapsack = %d\\n", result);

    return 0;
}
  `,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

const int NEG_INF = -1e9;

int knapsack_memoized(
    int index,
    int capacity,
    int n,
    const vector<int>& weights,
    const vector<int>& values,
    vector<vector<int>>& dp
) {
    if (capacity < 0) {
        return NEG_INF;
    }
    if (index == n || capacity == 0) {
        return 0;
    }

    if (dp[index][capacity] != -1) {
        return dp[index][capacity];
    }

    int exclude_item_value = knapsack_memoized(index + 1, capacity, n, weights, values, dp);

    int include_item_value = NEG_INF;
    if (weights[index] <= capacity) {
        include_item_value = values[index] + knapsack_memoized(index + 1, capacity - weights[index], n, weights, values, dp);
    }

    return dp[index][capacity] = max(exclude_item_value, include_item_value);
}

int main() {
    int n, W;
    cout << "Enter number of items: " << endl;
    cin >> n;

    if (n <= 0) {
        cout << "Invalid number of items." << endl;
        return 1;
    }

    cout << "Enter knapsack capacity: " << endl;
    cin >> W;

    if (W < 0) {
        cout << "Invalid knapsack capacity." << endl;
        return 1;
    }

    vector<int> weights(n);
    vector<int> values(n);

    cout << "Enter weight and value of each item (weight value):" << endl;
    for (int i = 0; i < n; ++i) {
        cout << "Item " << i + 1 << ": ";
        cin >> weights[i] >> values[i];
    }

    vector<vector<int>> dp(n, vector<int>(W + 1, -1));

    int max_value = knapsack_memoized(0, W, n, weights, values, dp);

    cout << "Maximum value that can be obtained = " << max_value << endl;

    return 0;
}
`
  },
  sampleInput: "3\n50\n10 60\n20 100\n30 120",
};
