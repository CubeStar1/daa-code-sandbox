import type { Program } from "../types";

export const floydWarshallProgram: Program = {
  id: "floyd-warshall",
  name: "Floyd-Warshall Algorithm",
  description:
    "Floyd-Warshall's algorithm is an algorithm for finding the shortest paths in a directed weighted graph with positive or negative edge weights (but with no negative cycles). A single execution of the algorithm will find the lengths (summed weights) of the shortest paths between all pairs of vertices.",
  category: "Dynamic Programming",
  examples: [
    {
      input:
        "Graph (Adjacency Matrix - use 99999 for infinity):\n0 5 99999 10\n99999 0 3 99999\n99999 99999 0 1\n99999 99999 99999 0\nNumber of vertices: 4",
      output:
        "Shortest Path Matrix:\n0 5 8 9\n99999 0 3 4\n99999 99999 0 1\n99999 99999 99999 0",
      explanation:
        "The output matrix shows the shortest path distances between all pairs of vertices.",
    },
  ],
  algorithmSteps: [
    "Initialize a distance matrix `dist[V][V]` with the given edge weights. `dist[i][j]` is the weight of the direct edge from `i` to `j`. If no direct edge exists, set it to infinity. `dist[i][i]` is 0.",
    "For each intermediate vertex `k` from 0 to V-1 (where V is the number of vertices):",
    "  For each source vertex `i` from 0 to V-1:",
    "    For each destination vertex `j` from 0 to V-1:",
    "      If the path from `i` to `j` through `k` (i.e., `dist[i][k] + dist[k][j]`) is shorter than the current `dist[i][j]`,",
    "      Then update `dist[i][j] = dist[i][k] + dist[k][j]`.",
    "The final `dist` matrix contains the shortest path distances between all pairs of vertices.",
    "The algorithm can also detect negative cycles if, after completion, any `dist[i][i]` becomes negative.",
  ],
  keyProperties: [
    "Computes all-pairs shortest paths in a weighted directed graph.",
    "Handles positive or negative edge weights (but not negative cycles).",
    "Based on dynamic programming principles.",
    "Time Complexity: O(V^3), where V is the number of vertices.",
    "Space Complexity: O(V^2) for storing the distance matrix.",
  ],
  timeComplexity: {
    best: "O(V^3)",
    average: "O(V^3)",
    worst: "O(V^3)",
    space: "O(V^2)",
    analysis: `
# Time Complexity Analysis for Floyd-Warshall Algorithm

## Algorithm Overview

Floyd-Warshall's algorithm finds the shortest paths between all pairs of vertices in a weighted graph. It considers all possible paths through intermediate vertices.

The core idea is that for any pair of vertices (i, j), the shortest path either uses only vertices from the set {0, 1, ..., k-1} as intermediates, or it goes from i to k and then from k to j, also using only vertices from {0, 1, ..., k-1} as intermediates in those subpaths.

## Structure

The algorithm uses three nested loops:

1.  Outer loop for \\\`k\\\` (intermediate vertex) from 0 to V-1.
2.  Middle loop for \\\`i\\\` (source vertex) from 0 to V-1.
3.  Inner loop for \\\`j\\\` (destination vertex) from 0 to V-1.

Inside the innermost loop, the following update rule is applied:
\\\`dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);\\\`
This operation takes constant time.

## Complexity Calculation

-   The outer loop (for \\\`k\\\`) runs V times.
-   The middle loop (for \\\`i\\\`) runs V times for each iteration of the \\\`k\\\`-loop.
-   The inner loop (for \\\`j\\\`) runs V times for each iteration of the \\\`i\\\`-loop.

Therefore, the total number of times the constant time update operation is performed is V * V * V = V³.

## Phases

1.  **Initialization:** Setting up the initial distance matrix based on direct edge weights takes O(V²) time.
2.  **Main Computation:** The three nested loops, which form the core of the algorithm, contribute O(V³) time.

## Complexity Summary

| Case    | Time Complexity | Space Complexity |
|---------|-----------------|------------------|
| Best    | O(V³)           | O(V²)            |
| Average | O(V³)           | O(V²)            |
| Worst   | O(V³)           | O(V²)            |

*(V = number of vertices)*

### Time Complexity

-   The algorithm's performance is dominated by the triple nested loop structure.
-   Each loop runs V times, leading to a consistent time complexity of **O(V³)** for all cases (best, average, and worst), regardless of the graph's density or edge weights (as long as there are no negative cycles).

### Space Complexity

-   The primary space requirement is for the distance matrix \\\`dist[V][V]\\\`, which stores the shortest path distances. This requires **O(V²)** space.
-   If a predecessor matrix is also maintained to reconstruct paths, it would also take O(V²) space.

Floyd-Warshall is particularly useful for dense graphs where V is relatively small, due to its O(V³) complexity. For sparse graphs, running Dijkstra's algorithm from each vertex (if edge weights are non-negative) can sometimes be more efficient.
    `,
  },
  code: {
    c: `
#include <stdio.h>
#include <limits.h> 

#define MAX_VERTICES 100
#define INF 99999 

void printMatrix(int matrix[MAX_VERTICES][MAX_VERTICES], int V) {
    printf("Shortest Path Matrix:\\n");
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            if (matrix[i][j] == INF)
                printf("%7s", "INF");
            else
                printf("%7d", matrix[i][j]);
        }
        printf("\\n");
    }
}

void floydWarshall(int graph[MAX_VERTICES][MAX_VERTICES], int V) {
    int dist[MAX_VERTICES][MAX_VERTICES];
    int i, j, k;


    for (i = 0; i < V; i++)
        for (j = 0; j < V; j++)
            dist[i][j] = graph[i][j];


    for (k = 0; k < V; k++) {
        for (i = 0; i < V; i++) {
            for (j = 0; j < V; j++) {
                if (dist[i][k] != INF && dist[k][j] != INF && 
                    dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }

    printMatrix(dist, V);

    for (i = 0; i < V; i++) {
        if (dist[i][i] < 0) {
            printf("\\nGraph contains a negative weight cycle!\\n");
            return;
        }
    }
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

    printf("Enter the adjacency matrix (weights, use %d for INF) for the graph (%d x %d):\\n", INF, V, V);
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            scanf("%d", &graph[i][j]);
        }
    }

    floydWarshall(graph, V);

    return 0;
}
  `,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

const int INF = 99999;

void printMatrix(const vector<vector<int>>& matrix, int V) {
    cout << "Shortest Path Matrix:" << endl;
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            if (matrix[i][j] == INF)
                cout << setw(7) << "INF";
            else
                cout << setw(7) << matrix[i][j];
        }
        cout << endl;
    }
}

void floydWarshall(const vector<vector<int>>& graph, int V) {
    vector<vector<int>> dist = graph;

    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] != INF && dist[k][j] != INF &&
                    dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }

    printMatrix(dist, V);

    for (int i = 0; i < V; i++) {
        if (dist[i][i] < 0) {
            cout << "\nGraph contains a negative weight cycle!" << endl;
            return;
        }
    }
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
    cout << "Enter the adjacency matrix (weights, use " << INF << " for INF) for the graph (" << V << " x " << V << "):" << endl;
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            cin >> graph[i][j];
        }
    }

    floydWarshall(graph, V);

    return 0;
}
`
  },
  sampleInput: "4\n0 5 99999 10\n99999 0 3 99999\n99999 99999 0 1\n99999 99999 99999 0",
};
