import type { Program } from "../types";

export const warshallProgram: Program = {
  id: "warshall",
  name: "Warshall's Algorithm",
  description:
    "Warshall's algorithm computes the transitive closure of a directed graph. It determines if there is a path (direct or indirect) between all pairs of vertices.",
  category: "Dynamic Programming", // Or "Graph Algorithms"
  examples: [
    {
      input:
        "Graph (Adjacency Matrix):\n0 1 0 0\n0 0 0 1\n0 0 0 0\n1 0 1 0\nNumber of vertices: 4",
      output:
        "Transitive Closure Matrix:\n1 1 1 1\n1 1 1 1\n0 0 0 0\n1 1 1 1",
      explanation:
        "The output shows all pairs (i,j) for which there's a path from vertex i to vertex j.",
    },
  ],
  algorithmSteps: [
    "Initialize the transitive closure matrix `T` with the given adjacency matrix `A` of the graph.",
    "For each intermediate vertex `k` from 0 to V-1 (where V is the number of vertices):",
    "  For each source vertex `i` from 0 to V-1:",
    "    For each destination vertex `j` from 0 to V-1:",
    "      If there is a path from `i` to `k` AND a path from `k` to `j` (i.e., `T[i][k]` is true AND `T[k][j]` is true),",
    "      Then set `T[i][j]` to true (meaning there is a path from `i` to `j` via `k`).",
    "      Mathematically: `T[i][j] = T[i][j] OR (T[i][k] AND T[k][j])`.",
    "The final matrix `T` represents the transitive closure.",
  ],
  keyProperties: [
    "Computes all-pairs reachability in a directed graph.",
    "Based on dynamic programming principles.",
    "Can be implemented using boolean (0/1) values for reachability.",
    "Time Complexity: O(V^3), where V is the number of vertices.",
    "Space Complexity: O(V^2) for storing the transitive closure matrix.",
  ],
  timeComplexity: {
    best: "O(V^3)",
    average: "O(V^3)",
    worst: "O(V^3)",
    space: "O(V^2)",
    analysis: `
# Time Complexity Analysis for Warshall's Algorithm

## Algorithm Overview

Warshall's algorithm is used to find the transitive closure of a directed graph. This means it determines for every pair of vertices (i, j) whether there is a path from i to j.

The algorithm works by iteratively considering each vertex \\\`k\\\` as an intermediate vertex in paths. For any pair of vertices (i, j), if there's a path from i to k and a path from k to j, then there's a path from i to j.

## Structure

The core of Warshall's algorithm consists of three nested loops:

1.  Outer loop for \\\`k\\\` (intermediate vertex) from 0 to V-1.
2.  Middle loop for \\\`i\\\` (source vertex) from 0 to V-1.
3.  Inner loop for \\\`j\\\` (destination vertex) from 0 to V-1.

Inside the innermost loop, a constant time operation is performed:
\\\`T[i][j] = T[i][j] || (T[i][k] && T[k][j]);\\\`

## Complexity Calculation

-   The outer loop runs V times.
-   The middle loop runs V times for each iteration of the outer loop.
-   The inner loop runs V times for each iteration of the middle loop.

Thus, the total number of times the constant time operation inside the loops is executed is V * V * V = V³.

## Phases

1.  **Initialization:** Copying the adjacency matrix to the transitive closure matrix (or initializing it based on direct edges) takes O(V²) time.
2.  **Main Computation:** The three nested loops contribute O(V³) time.

## Complexity Summary

| Case    | Time Complexity | Space Complexity |
|---------|-----------------|------------------|
| Best    | O(V³)           | O(V²)            |
| Average | O(V³)           | O(V²)            |
| Worst   | O(V³)           | O(V²)            |

*(V = number of vertices)*

### Time Complexity

-   The dominant part of the algorithm is the triple nested loop structure. Each loop iterates V times.
-   Therefore, the time complexity is consistently **O(V³)** regardless of the graph's structure (best, average, or worst case).

### Space Complexity

-   The algorithm requires an adjacency matrix (or similar representation) to store the graph, which is O(V²).
-   It also requires a matrix to store the transitive closure, also O(V²).
-   Thus, the auxiliary space complexity is **O(V²)**.

Warshall's algorithm is straightforward but not the most efficient for very large sparse graphs where other algorithms might perform better for specific tasks like single-source reachability. However, for all-pairs reachability on dense graphs, its O(V³) complexity is standard for this type of problem solved via matrix operations.
    `,
  },
  code: {
    c: `
#include <stdio.h>
#include <stdbool.h>

#define MAX_VERTICES 100

void printMatrix(int matrix[MAX_VERTICES][MAX_VERTICES], int V) {
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            printf("%d ", matrix[i][j]);
        }
        printf("\\n");
    }
}

void warshall(int graph[MAX_VERTICES][MAX_VERTICES], int V) {
    int transitiveClosure[MAX_VERTICES][MAX_VERTICES];
    int i, j, k;

    for (i = 0; i < V; i++)
        for (j = 0; j < V; j++)
            transitiveClosure[i][j] = graph[i][j];
    for (i = 0; i < V; i++)
        transitiveClosure[i][i] = 1; 

    for (k = 0; k < V; k++) {
        for (i = 0; i < V; i++) {
            for (j = 0; j < V; j++) {
                if (transitiveClosure[i][k] && transitiveClosure[k][j]) {
                    transitiveClosure[i][j] = 1;
                }
            }
        }
    }

    printf("Transitive Closure Matrix:\\n");
    printMatrix(transitiveClosure, V);
}

int main(void) {
    int V;
    int graph[MAX_VERTICES][MAX_VERTICES];

    printf("Enter the number of vertices (max %d): \\n", MAX_VERTICES);
    scanf("%d", &V);

    if (V <= 0 || V > MAX_VERTICES) {
        printf("Invalid number of vertices.\\n");
        return 1;
    }

    printf("Enter the adjacency matrix (0 or 1) for the graph (%d x %d):\\n", V, V);
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            scanf("%d", &graph[i][j]);
        }
    }
    

    warshall(graph, V);

    return 0;
}
  `,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

void printMatrix(const vector<vector<int>>& matrix) {
    for (const auto& row : matrix) {
        for (int val : row) {
            cout << val << " ";
        }
        cout << endl;
    }
}

void warshall(vector<vector<int>>& graph) {
    int V = graph.size();
    vector<vector<int>> transitiveClosure = graph;

    for (int i = 0; i < V; i++) {
        transitiveClosure[i][i] = 1;
    }

    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (transitiveClosure[i][k] && transitiveClosure[k][j]) {
                    transitiveClosure[i][j] = 1;
                }
            }
        }
    }

    cout << "Transitive Closure Matrix:" << endl;
    printMatrix(transitiveClosure);
}

int main() {
    int V;
    cout << "Enter the number of vertices: " << endl;
    cin >> V;

    if (V <= 0) {
        cout << "Invalid number of vertices." << endl;
        return 1;
    }

    vector<vector<int>> graph(V, vector<int>(V));
    cout << "Enter the adjacency matrix (0 or 1) for the graph (" << V << " x " << V << "):" << endl;
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            cin >> graph[i][j];
        }
    }

    warshall(graph);

    return 0;
}
`
  },
  sampleInput: "4\n0 1 0 0\n0 0 0 1\n0 0 0 0\n1 0 1 0",
};
