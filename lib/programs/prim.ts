import type { Program } from "../types";

export const primProgram: Program = {
  id: "prim",
  name: "Prim's Algorithm",
  description:
    "Prim's algorithm is a greedy algorithm that finds a minimum spanning tree (MST) for a weighted undirected graph. This means it finds a subset of the edges that forms a tree that includes every vertex, where the total weight of all the edges in the tree is minimized.",
  category: "Greedy Technique",
  examples: [
    {
      input:
        "Graph (Adjacency Matrix - use 0 or INF for no edge, actual weight otherwise):\n0 2 0 6 0\n2 0 3 8 5\n0 3 0 0 7\n6 8 0 0 9\n0 5 7 9 0\nNumber of vertices: 5",
      output:
        "Edges in MST:\n0 - 1 (Weight: 2)\n1 - 2 (Weight: 3)\n0 - 3 (Weight: 6) -> Incorrect, should be 1-4 (Weight 5) if starting from 0, then 0-1, 1-2, 1-4, 3-0 (or 0-3 if it's smaller than others from 0)",
      explanation:
        "Corrected Example Output (Typical for Prim's from source 0):\nEdge   Weight\n0 - 1    2\n1 - 2    3\n1 - 4    5\n0 - 3    6 (If 3 is chosen from 0 before other paths to 3 are found. Actual edges depend on tie-breaking and vertex selection order)",
    },
  ],
  algorithmSteps: [
    "Initialize a `key` array of size V (number of vertices). `key[i]` will store the minimum weight of an edge connecting vertex `i` to the MST. Set `key[0] = 0` (if starting MST from vertex 0) and all other `key[i] = infinity`.",
    "Initialize a `parent` array of size V. `parent[i]` will store the vertex from which vertex `i` is included in the MST.",
    "Initialize a boolean array `mstSet[]` of size V. `mstSet[i]` will be true if vertex `i` is already included in the MST. Initialize all to `false`.",
    "Set `key[0] = 0` and `parent[0] = -1` (or any indicator for the root).",
    "Loop V times (to construct MST with V vertices):",
    "  a. Pick a vertex `u` not yet in `mstSet` that has the minimum `key` value.",
    "  b. Add `u` to `mstSet` (i.e., `mstSet[u] = true`).",
    "  c. For all adjacent vertices `v` of `u`:",
    "     If `v` is not in `mstSet` and the weight of edge `(u,v)` is less than `key[v]`, then update `key[v] = graph[u][v]` and set `parent[v] = u`.",
    "After the loop, the `parent[]` array can be used to print the edges of the MST.",
  ],
  keyProperties: [
    "Finds a Minimum Spanning Tree (MST) for a connected, undirected, weighted graph.",
    "Greedy approach: at each step, it adds the cheapest possible edge connecting a vertex in the MST to a vertex outside the MST.",
    "Time Complexity (Naive): O(V^2) using adjacency matrix.",
    "Time Complexity (Optimized): O(E log V) or O((V+E)logV) using adjacency list and a binary heap/Fibonacci heap.",
    "Space Complexity: O(V) for key, parent, mstSet arrays, plus O(V^2) for adjacency matrix or O(V+E) for adjacency list.",
  ],
  timeComplexity: {
    best: "O(V^2) (Adjacency Matrix) / O(E log V) (Adj. List + Min-Priority Queue)",
    average: "O(V^2) (Adjacency Matrix) / O(E log V) (Adj. List + Min-Priority Queue)",
    worst: "O(V^2) (Adjacency Matrix) / O(E log V) (Adj. List + Min-Priority Queue)",
    space: "O(V^2) (Adjacency Matrix) or O(V+E) (Adjacency List)",
    analysis: `
# Time Complexity Analysis for Prim's Algorithm

## Algorithm Overview

Prim's algorithm grows a Minimum Spanning Tree (MST) from an arbitrary starting vertex. At each step, it adds the minimum weight edge that connects a vertex in the growing MST to a vertex outside the MST.

## Implementation Variants

1.  **Using Adjacency Matrix and Linear Scan (Naive - as in the provided C code):**
    -   The main loop runs V times to select V vertices for the MST.
    -   Inside the loop:
        -   Finding the vertex 'u' with the minimum 'key' value not yet in 'mstSet' takes O(V) time (linear scan through 'key' array).
        -   Updating the 'key' values for adjacent vertices of 'u': For each vertex 'v', it checks if 'v' is adjacent to 'u' and updates 'key[v]' if a shorter path to the MST is found through 'u'. This takes O(V) time.
    -   Total Time: V * (O(V) for min-key selection + O(V) for key updates) = V * O(V) = O(V^2).

2.  **Using Adjacency List and Min-Priority Queue (e.g., Binary Heap):**
    -   Initialization: Insert all vertices into a min-priority queue with their 'key' values (0 for start, infinity for others). O(V log V) or O(V) depending on heap implementation.
    -   Main loop (runs V times until priority queue is empty):
        -   Extract vertex 'u' with minimum 'key' from priority queue: O(log V). Total for V extractions: O(V log V).
        -   For each neighbor 'v' of 'u':
            If 'v' is in the priority queue and weight(u,v) < key[v], update key[v] to weight(u,v) and perform a 'decreaseKey' operation in the priority queue. A 'decreaseKey' operation takes O(log V).
            Each edge (u,v) results in at most one 'decreaseKey' operation. Total for all edges: O(E log V).
    -   Total Time: O(V log V + E log V) = O((V+E) log V). If E is much larger than V, this is often written as O(E log V).
        Using a Fibonacci heap, 'decreaseKey' is O(1) amortized, leading to O(V log V + E).

## Complexity Summary (for the provided C code - Adjacency Matrix)

| Operation                     | Cost   | Times Executed |
|-------------------------------|--------|----------------|
| Initialization (key, parent, mstSet) | O(V)   | 1              |
| Main loop                     |        | V              |
|   Min-key selection (linear scan) | O(V)   | V              |
|   Update keys of adj. vertices | O(V)   | V              |

This leads to a time complexity of O(V^2) for the adjacency matrix implementation.

### Space Complexity

-   'key' array: O(V)
-   'parent' array: O(V)
-   'mstSet' array: O(V)
-   'graph' (adjacency matrix): O(V^2)

Total Space Complexity: O(V^2) for adjacency matrix representation.
If an adjacency list were used, it would be O(V+E).

(V = number of vertices, E = number of edges)
    `,
  },
  code: {
    c: `
#include <stdio.h>
#include <limits.h> 
#include <stdbool.h> 

#define MAX_VERTICES 100
#define INF INT_MAX 

int minKey(int key[], bool mstSet[], int V) {
    int min = INF, min_index = -1;

    for (int v = 0; v < V; v++) {
        if (mstSet[v] == false && key[v] < min) {
            min = key[v];
            min_index = v;
        }
    }
    return min_index;
}

void printMST(int parent[], int graph[MAX_VERTICES][MAX_VERTICES], int V) {
    printf("Edge   Weight\\n");
    for (int i = 1; i < V; i++) { 
        if (parent[i] < 0 || parent[i] >= V) {
            printf("Error: Invalid parent for vertex %d\\n", i);
            continue;
        }
         if (graph[i][parent[i]] == 0 && i != parent[i]) {
         }
        printf("%d - %d    %d \\n", parent[i], i, graph[i][parent[i]]);
    }
}

void primMST(int graph[MAX_VERTICES][MAX_VERTICES], int V) {
    int parent[MAX_VERTICES]; 
    int key[MAX_VERTICES];    
    bool mstSet[MAX_VERTICES]; 

    for (int i = 0; i < V; i++) {
        key[i] = INF;
        mstSet[i] = false;
        parent[i] = -1; 
    }

    key[0] = 0;     

    for (int count = 0; count < V; count++) {
        int u = minKey(key, mstSet, V);
        
        if (u == -1) {
            if (count < V && V > 0) { 
                 bool all_in_mst = true;
                 for(int k=0; k<V; ++k) if(!mstSet[k]) all_in_mst = false;
                 if(!all_in_mst) printf("Graph might be disconnected. MST construction stopped.\\n");
            }
            break;
        }

        mstSet[u] = true;

        for (int v = 0; v < V; v++) {

            if (graph[u][v] != 0 && mstSet[v] == false && graph[u][v] < key[v]) {
                parent[v] = u;
                key[v] = graph[u][v];
            }
        }
    }

    printMST(parent, graph, V);
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

    printf("Enter the adjacency matrix for the graph (%d x %d):\\n", V, V);
    printf("(Use 0 for no direct edge between different vertices, or actual weight. Self-loops are usually 0 or ignored):\\n");
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            scanf("%d", &graph[i][j]);
        }
    }

    primMST(graph, V);

    return 0;
}
  `,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

const int INF = INT_MAX;

int minKey(const vector<int>& key, const vector<bool>& mstSet, int V) {
    int min = INF, min_index = -1;

    for (int v = 0; v < V; v++) {
        if (!mstSet[v] && key[v] < min) {
            min = key[v];
            min_index = v;
        }
    }
    return min_index;
}

void printMST(const vector<int>& parent, const vector<vector<int>>& graph, int V) {
    cout << "Edge   Weight" << endl;
    for (int i = 1; i < V; i++) {
        if (parent[i] < 0 || parent[i] >= V) {
            cout << "Error: Invalid parent for vertex " << i << endl;
            continue;
        }
        cout << parent[i] << " - " << i << "    " << graph[i][parent[i]] << endl;
    }
}

void primMST(const vector<vector<int>>& graph, int V) {
    vector<int> parent(V);
    vector<int> key(V);
    vector<bool> mstSet(V);

    for (int i = 0; i < V; i++) {
        key[i] = INF;
        mstSet[i] = false;
        parent[i] = -1;
    }

    key[0] = 0;

    for (int count = 0; count < V; count++) {
        int u = minKey(key, mstSet, V);

        if (u == -1) {
            bool all_in_mst = true;
            for(int k=0; k<V; ++k) if(!mstSet[k]) all_in_mst = false;
            if(!all_in_mst) cout << "Graph might be disconnected. MST construction stopped." << endl;
            break;
        }

        mstSet[u] = true;

        for (int v = 0; v < V; v++) {
            if (graph[u][v] != 0 && !mstSet[v] && graph[u][v] < key[v]) {
                parent[v] = u;
                key[v] = graph[u][v];
            }
        }
    }

    printMST(parent, graph, V);
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
    cout << "Enter the adjacency matrix for the graph (" << V << " x " << V << "):" << endl;
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            cin >> graph[i][j];
        }
    }

    primMST(graph, V);

    return 0;
}
`
  },
  sampleInput: "5\n0 2 0 6 0\n2 0 3 8 5\n0 3 0 0 7\n6 8 0 0 9\n0 5 7 9 0",
};
