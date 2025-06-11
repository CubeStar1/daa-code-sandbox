import type { Program } from "../types";

export const dijkstraProgram: Program = {
  id: "dijkstra",
  name: "Dijkstra's Algorithm",
  description:
    "Dijkstra's algorithm finds the shortest paths from a single source vertex to all other vertices in a weighted graph with non-negative edge weights. It can be used for both directed and undirected graphs.",
  category: "Greedy Technique",
  examples: [
    {
      input:
        "Graph (Adjacency Matrix - use 99999 for infinity, 0 for no edge if not self-loop):\n0 4 0 0 0 0 0 8 0\n4 0 8 0 0 0 0 11 0\n0 8 0 7 0 4 0 0 2\n0 0 7 0 9 14 0 0 0\n0 0 0 9 0 10 0 0 0\n0 0 4 14 10 0 2 0 0\n0 0 0 0 0 2 0 1 6\n8 11 0 0 0 0 1 0 7\n0 0 2 0 0 0 6 7 0\nNumber of vertices: 9\nSource vertex: 0",
      output:
        "Vertex   Distance from Source\n0        0\n1        4\n2        12\n3        19\n4        21\n5        11\n6        9\n7        8\n8        14",
      explanation:
        "The output shows the shortest distance from the source vertex (0) to all other vertices.",
    },
  ],
  algorithmSteps: [
    "Initialize a distance array `dist[]`, where `dist[i]` stores the shortest distance from the source to vertex `i`. Set `dist[source] = 0` and all other `dist[i] = infinity`.",
    "Create a boolean array `sptSet[]` (shortest path tree set) of size V (number of vertices), initialized to `false`. `sptSet[i]` will be true if vertex `i` is included in the shortest path tree or its shortest distance from the source is finalized.",
    "Loop V-1 times (as one vertex, the source, is already processed implicitly):",
    "  a. Pick the vertex `u` not yet in `sptSet` that has the minimum distance value in `dist[]`. This can be done by iterating through all vertices.",
    "  b. Add `u` to `sptSet` (i.e., `sptSet[u] = true`).",
    "  c. For all adjacent vertices `v` of `u`:",
    "     If `v` is not in `sptSet` and there is an edge from `u` to `v`, and the total weight of path from source to `v` through `u` (i.e., `dist[u] + graph[u][v]`) is smaller than the current value of `dist[v]`, then update `dist[v] = dist[u] + graph[u][v]`.",
    "After the loop, the `dist[]` array contains the shortest path distances from the source vertex to all other vertices.",
  ],
  keyProperties: [
    "Finds single-source shortest paths.",
    "Works on weighted graphs (directed or undirected).",
    "Requires non-negative edge weights.",
    "Greedy approach: at each step, it picks the locally optimal choice (vertex with minimum distance).",
    "Time Complexity (Naive): O(V^2) using adjacency matrix or list without a priority queue.",
    "Time Complexity (Optimized): O(E log V) or O((V+E)logV) using adjacency list and a binary heap/Fibonacci heap as a priority queue.",
    "Space Complexity: O(V) for distance array and sptSet, plus O(V^2) for adjacency matrix or O(V+E) for adjacency list.",
  ],
  timeComplexity: {
    best: "O(V^2) (Adjacency Matrix) / O(E log V) (Adj. List + Min-Priority Queue)",
    average: "O(V^2) (Adjacency Matrix) / O(E log V) (Adj. List + Min-Priority Queue)",
    worst: "O(V^2) (Adjacency Matrix) / O(E log V) (Adj. List + Min-Priority Queue)",
    space: "O(V^2) (Adjacency Matrix) or O(V+E) (Adjacency List)",
    analysis: `
# Time Complexity Analysis for Dijkstra's Algorithm

## Algorithm Overview

Dijkstra's algorithm finds the shortest paths from a single source vertex to all other vertices in a graph with non-negative edge weights. It maintains a set of vertices whose shortest distance from the source is already finalized.

## Implementation Variants

1.  **Using Adjacency Matrix and Linear Scan (Naive):**
    -   Outer loop runs V times (or V-1 times).
    -   Inside the loop, finding the vertex with the minimum distance (not yet in SPT set) takes O(V) time.
    -   Updating distances of adjacent vertices also takes O(V) in the worst case (dense graph).
    -   Total Time: V * (O(V) + O(V)) = O(V^2).

2.  **Using Adjacency List and Min-Priority Queue (e.g., Binary Heap):**
    -   Building the initial priority queue: O(V) if all distances are infinity except source.
    -   Outer loop (extract-min from priority queue): Runs V times. Each 'extractMin' operation takes O(log V).
        Total for 'extractMin': V * O(log V) = O(V log V).
    -   Inner loop (updating distances of adjacent vertices):
        For each edge (u, v), if 'dist[v]' is updated, a 'decreaseKey' operation is performed on the priority queue. This takes O(log V).
        Each edge is processed at most once during the algorithm when its source vertex 'u' is extracted from the priority queue.
        Total for 'decreaseKey' operations across all edges: E * O(log V) = O(E log V).
    -   Total Time: O(V log V + E log V) = O((V+E) log V) or simply O(E log V) if E > V (connected graph).
        If a Fibonacci heap is used, 'decreaseKey' is O(1) amortized, leading to O(V log V + E).

## Complexity Summary (for the provided C code - Adjacency Matrix)

| Operation                     | Cost   | Times Executed |
|-------------------------------|--------|----------------|
| Initialization ('dist', 'sptSet') | O(V)   | 1              |
| Main loop                     |        | V              |
|   'minDistance' function      | O(V)   | V              |
|   Update adjacent distances   | O(V)   | V              |

-   The 'minDistance' function iterates through all V vertices to find the one with the minimum distance not yet in 'sptSet'. This is called V times.
-   Updating distances of adjacent vertices involves iterating up to V neighbors for the chosen vertex 'u'.

This leads to a time complexity of O(V^2) for the adjacency matrix implementation.

### Space Complexity

-   'dist' array: O(V)
-   'sptSet' array: O(V)
-   'graph' (adjacency matrix): O(V^2)

Total Space Complexity: O(V^2) for adjacency matrix representation.
If an adjacency list were used, it would be O(V+E).

(V = number of vertices, E = number of edges)
    `,
  },
  code: {
    c: `
#include <stdio.h>
#define INF 99999
#define MAX 100


int main() {
    int n, src;
    int graph[MAX][MAX];

    printf("Enter number of vertices: ");
    scanf("%d", &n);

    printf("Enter the adjacency matrix (0 if no edge, use INF = %d for no path):\\n", INF);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &graph[i][j]);

    printf("Enter source vertex (0 to %d): \\n", n - 1);
    scanf("%d", &src);

    dijkstra(graph, n, src);
    return 0;
}
void dijkstra(int graph[MAX][MAX],int n, int src)
{
    int dist[MAX];
    int visited[MAX];
    
    for(int i=0;i<n;i++)
    {
        dist[i]=INF;
        visited[i]=0;
    }
    dist[src]=0;
    for(int j=0;j<n-1;j++)
    {
        int u=minDist(dist,visited,n);
        visited[u]=1;

        for(int v=0;v<n;v++)
        {
            if(!visited[v]&&graph[u][v]&&dist[u]!=INF&&dist[u]+graph[u][v]<dist[v])
                dist[v]=dist[u]+graph[u][v];
        }
    }
    printf("Vertex \\t Distance from Source %d\\n", src);
    for (int i = 0; i < n; i++)
        printf("%d \\t\\t %d\\n", i, dist[i]);
}

int minDist(int dist[], int visited[],int n)
{
    int min=INF,min_index;
    for(int v=0;v<n;v++)
    {
        if(!visited[v]&&dist[v]<min)
        {
            min=dist[v];
            min_index=v;
        }
    }
    return min_index;
}
  `,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

#define INF INT_MAX

int minDistance(const vector<int>& dist, const vector<bool>& sptSet, int V) {
    int min = INF, min_index = -1;

    for (int v = 0; v < V; v++) {
        if (sptSet[v] == false && dist[v] <= min) {
            min = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

void printSolution(const vector<int>& dist, int V, int src) {
    cout << "Vertex   Distance from Source " << src << endl;
    for (int i = 0; i < V; i++) {
        if (dist[i] == INF) {
            cout << i << " \t\t " << "INF" << endl;
        } else {
            cout << i << " \t\t " << dist[i] << endl;
        }
    }
}

void dijkstra(const vector<vector<int>>& graph, int src, int V) {
    vector<int> dist(V);
    vector<bool> sptSet(V);

    for (int i = 0; i < V; i++) {
        dist[i] = INF;
        sptSet[i] = false;
    }

    dist[src] = 0;

    for (int count = 0; count < V - 1; count++) {
        int u = minDistance(dist, sptSet, V);
        
        if (u == -1) break;

        sptSet[u] = true;

        for (int v = 0; v < V; v++) {
            if (!sptSet[v] && graph[u][v] && dist[u] != INF &&
                dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    printSolution(dist, V, src);
}

int main() {
    int V;
    int src_vertex;

    cout << "Enter the number of vertices: " << endl;
    cin >> V;

    if (V <= 0) {
        cout << "Invalid number of vertices." << endl;
        return 1;
    }

    vector<vector<int>> graph(V, vector<int>(V));
    cout << "Enter the adjacency matrix for the graph (" << V << " x " << V << "):" << endl;
    cout << "(Use " << 99999 << " for infinity/no direct path, 0 for self-loops if no weight):" << endl;
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            cin >> graph[i][j];
            if(graph[i][j] == 99999) graph[i][j] = INF;
        }
    }

    cout << "Enter the source vertex (0 to " << V - 1 << "): " << endl;
    cin >> src_vertex;

    if (src_vertex < 0 || src_vertex >= V) {
        cout << "Invalid source vertex." << endl;
        return 1;
    }

    dijkstra(graph, src_vertex, V);

    return 0;
}
`
  },
  sampleInput: "9\n0 4 0 0 0 0 0 8 0\n4 0 8 0 0 0 0 11 0\n0 8 0 7 0 4 0 0 2\n0 0 7 0 9 14 0 0 0\n0 0 0 9 0 10 0 0 0\n0 0 4 14 10 0 2 0 0\n0 0 0 0 0 2 0 1 6\n8 11 0 0 0 0 1 0 7\n0 0 2 0 0 0 6 7 0\n0",
};
