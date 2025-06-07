import type { Program } from "../types"

export const topologicalSortProgram: Program = {
  id: "topological-sort",
  name: "Topological Sort (Kahn's Algorithm)",
  description:
    "Algorithm to find a linear ordering of nodes in a directed acyclic graph (DAG) such that for every directed edge from node u to node v, node u comes before node v in the ordering. This implementation uses Kahn's algorithm, which is based on in-degrees.",
  category: "Decrease and Conquer",
  examples: [
    {
      input: "6\n6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1",
      output: "Topological order:\n4 5 0 2 3 1 \n(Note: Other valid orders like 5 4 0 2 3 1 may exist)",
      explanation:
        "A valid topological sort for the given DAG. Vertices are processed based on their in-degrees.",
    },
    {
      input: "3\n3\n0 1\n1 2\n2 0",
      output: "Topological order:\nGraph has a cycle! No topological ordering.\n",
      explanation: "The graph contains a cycle (0->1->2->0), so a topological sort is not possible.",
    },
  ],
  algorithmSteps: [
    "Initialize in-degrees of all vertices to 0.",
    "Read the graph edges and compute the actual in-degree for each vertex.",
    "Initialize a queue.",
    "Add all vertices with an in-degree of 0 to the queue.",
    "Initialize a counter for visited vertices to 0 and an array/list to store the topological order.",
    "While the queue is not empty:",
    "  Dequeue a vertex 'u' from the queue.",
    "  Add 'u' to the topological order list.",
    "  Increment the visited vertices counter.",
    "  For each neighbor 'v' of 'u':",
    "    Decrement the in-degree of 'v'.",
    "    If the in-degree of 'v' becomes 0, enqueue 'v'.",
    "If the count of visited vertices is not equal to the total number of vertices, the graph has a cycle, and no topological ordering exists.",
    "Otherwise, the list contains a valid topological order.",
  ],
  keyProperties: [
    "Applicable only to Directed Acyclic Graphs (DAGs).",
    "Kahn's algorithm is one of the standard methods (another is DFS-based).",
    "Can detect cycles in a directed graph.",
    "Multiple valid topological sorts can exist for a given DAG.",
    "Used in scheduling tasks, resolving dependencies (e.g., in compilers, build systems), and data serialization.",
  ],
  timeComplexity: {
    best: "O(V + E)",
    average: "O(V + E)",
    worst: "O(V + E)",
    space: "O(V + E) for adjacency list representation, O(V^2) for adjacency matrix. O(V) for queue and in-degree array.",
    analysis: `
# Time Complexity Analysis for Topological Sort (Kahn's Algorithm)

## Algorithm Overview

Kahn's algorithm for topological sorting works by iteratively finding nodes with no incoming edges (in-degree of 0), adding them to the sorted list, and then conceptually removing them and their outgoing edges from the graph. This process is repeated until no more such nodes can be found.

## Complexity Summary

| Case      | Time Complexity | Space Complexity (Adjacency List) | Space Complexity (Adjacency Matrix - as in code) |
|-----------|-----------------|-----------------------------------|----------------------------------------------------|
| **All**   | O(V + E)        | O(V + E)                          | O(V²) (for matrix) + O(V) (for queue/indegree)     |

Where V is the number of vertices and E is the number of edges.

## Detailed Analysis

### Time Complexity: O(V + E)

1.  **In-degree Calculation:** Iterating through all edges to calculate in-degrees takes O(E) time. If initializing in-degrees for all V vertices first, it's O(V) + O(E).
2.  **Initial Queue Population:** Scanning all V vertices to find those with an in-degree of 0 and adding them to the queue takes O(V) time.
3.  **Main Loop (Processing Vertices and Edges):**
    *   Each vertex is enqueued and dequeued at most once. This accounts for O(V) operations.
    *   When a vertex 'u' is dequeued, its outgoing edges are traversed. Each edge (u,v) in the graph is processed exactly once over the entire algorithm execution (when 'u' is dequeued and 'v's in-degree is updated). This accounts for O(E) operations.

Therefore, the total time complexity is O(V + E).

### Space Complexity

1.  **Graph Representation:**
    *   **Adjacency List (Typical):** O(V + E)
    *   **Adjacency Matrix (as in provided C code \\\`adj[MAX][MAX]\\\`):** O(V²) if MAX is considered proportional to V. The provided code uses a fixed \\\`MAX\\\`, so it's O(MAX²), but for analysis relative to V, it's O(V²).
2.  **In-degree Array (\\\`indeg\\\`):** O(V)
3.  **Queue (\\\`q\\\`):** In the worst case, all vertices might be in the queue (e.g., a graph with no edges, or many nodes with in-degree 0 initially), so O(V).
4.  **Output List (Implicit):** O(V) to store the topological sort.

So, for an adjacency list representation, the space is O(V + E). For the provided code's adjacency matrix, it's dominated by O(V²) + O(V) = O(V²).

## Notes on Provided C Code
- The C code uses an adjacency matrix \\\`adj[MAX][MAX]\\\` and a \\\`deg[MAX]\\\` array to store outgoing edges for each vertex in a compact way within the matrix structure. This is a common way to implement adjacency lists using a matrix if the maximum degree is bounded or if one wants to avoid dynamic memory allocation for lists per vertex.
- The \\\`deg[u]\\\` effectively tells how many neighbors \\\`u\\\` has, and \\\`adj[u][0...deg[u]-1]\\\` are those neighbors.
    `,
  },
  code: "#include <stdio.h>\n#include <stdlib.h>\n\n#define MAX 100\n\ntypedef struct {\n    int data[MAX];\n    int front, rear;\n} Queue;\n\nvoid initQueue(Queue *q) { q->front = q->rear = 0; }\nint  isEmpty(Queue *q) { return q->front == q->rear; }\nvoid enqueue(Queue *q, int x) { q->data[q->rear++] = x; }\nint  dequeue(Queue *q) { return q->data[q->front++]; }\n\nint main(void)\n{\n    int V, E;\n    printf(\"Enter number of vertices (max %d): \", MAX);\n    scanf(\"%d\", &V);\n\n    if (V <= 0 || V > MAX) {\n        printf(\"Invalid number of vertices\\n\");\n        return 0;\n    }\n\n    int adj[MAX][MAX];\n    int deg[MAX];\n    int indeg[MAX];\n\n    for (int i = 0; i < V; ++i) {\n        deg[i] = indeg[i] = 0;\n    }\n\n    printf(\"Enter number of directed edges: \");\n    scanf(\"%d\", &E);\n\n    printf(\"Enter edges as pairs: src dest (0-based labels)\\n\");\n    for (int i = 0; i < E; ++i) {\n        int u, v;\n        scanf(\"%d %d\", &u, &v);\n        adj[u][deg[u]++] = v;\n        indeg[v]++;\n    }\n\n    Queue q;\n    initQueue(&q);\n\n    for (int i = 0; i < V; ++i)\n        if (indeg[i] == 0) enqueue(&q, i);\n\n    int visited = 0;\n    printf(\"\\nTopological order:\\n\");\n    while (!isEmpty(&q)) {\n        int u = dequeue(&q);\n        printf(\"%d \", u);\n        visited++;\n\n        for (int k = 0; k < deg[u]; ++k) {\n            int v = adj[u][k];\n            if (--indeg[v] == 0)\n                enqueue(&q, v);\n        }\n    }\n    putchar('\\n');\n\n    if (visited != V)\n        printf(\"Graph has a cycle! No topological ordering.\\n\");\n\n    return 0;\n}",
}
