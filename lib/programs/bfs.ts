import type { Program } from "../types"

export const bfsProgram: Program = {
  id: "bfs",
  name: "Breadth-First Search (BFS)",
  description:
    "A graph traversal algorithm that explores all the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level. It uses a queue to keep track of the next location to visit.",
  category: "Decrease and Conquer", // As per user request, though typically graph traversal
  examples: [
    {
      input: "7\n8\n0 1\n0 2\n1 3\n1 4\n2 5\n2 6\n3 4\n5 6\n0",
      output: "Breadth First Traversal (starting from vertex 0):\n0 1 2 3 4 5 6 \n",
      explanation:
        "BFS starting from node 0 traverses level by level: 0, then its neighbors (1,2), then their unvisited neighbors (3,4,5,6).",
    },
    {
      input: "5\n4\n0 1\n0 2\n1 3\n2 4\n0",
      output: "Breadth First Traversal (starting from vertex 0):\n0 1 2 3 4 \n",
      explanation: "BFS explores nodes layer by layer. Starting at 0, it visits 1 and 2, then 3 (from 1) and 4 (from 2).",
    },
  ],
  algorithmSteps: [
    "Initialize a queue and add the starting vertex to it.",
    "Mark the starting vertex as visited.",
    "While the queue is not empty:",
    "  Dequeue a vertex 'u' from the front of the queue.",
    "  Process vertex 'u' (e.g., print it).",
    "  For each unvisited neighbor 'v' of 'u':",
    "    Mark 'v' as visited.",
    "    Enqueue 'v'.",
    "Repeat until the queue is empty, meaning all reachable vertices have been visited.",
  ],
  keyProperties: [
    "Finds the shortest path in terms of number of edges between two nodes in an unweighted graph.",
    "Used to find connected components in a graph.",
    "Can be used to detect cycles in an undirected graph (if we encounter a visited node that is not the parent of the current node in the BFS tree).",
    "Explores the graph layer by layer.",
    "Completeness: Guaranteed to find a path if one exists.",
    "Optimality: Finds the shortest path in unweighted graphs.",
  ],
  timeComplexity: {
    best: "O(V + E) for Adjacency List / O(V^2) for Adjacency Matrix",
    average: "O(V + E) for Adjacency List / O(V^2) for Adjacency Matrix",
    worst: "O(V + E) for Adjacency List / O(V^2) for Adjacency Matrix",
    space: "O(V) for storing visited array and queue.",
    analysis: `
# Time Complexity Analysis for Breadth-First Search (BFS)

## Algorithm Overview

BFS explores a graph by visiting all neighbors of a node before moving to the next level of neighbors. It uses a queue to manage the order of visitation and a 'visited' array to avoid processing nodes multiple times.

## Complexity Summary

| Representation    | Time Complexity | Space Complexity |
|-------------------|-----------------|------------------|
| Adjacency List    | O(V + E)        | O(V)             |
| Adjacency Matrix  | O(V²)           | O(V)             |

Where V is the number of vertices and E is the number of edges.

## Detailed Analysis

### Time Complexity

1.  **Initialization:**
    *   Setting up the 'visited' array takes O(V) time.
    *   Initializing the queue is O(1).

2.  **Queue Operations:**
    *   Each vertex is enqueued at most once: O(V) enqueue operations in total.
    *   Each vertex is dequeued at most once: O(V) dequeue operations in total.
    Each queue operation (enqueue/dequeue) typically takes O(1) time.

3.  **Vertex and Edge Processing:**
    *   **Adjacency List:** When a vertex 'u' is dequeued, BFS iterates through all its adjacent vertices. The sum of the lengths of all adjacency lists is O(E) for a directed graph and O(2E) for an undirected graph. So, all edges are examined once. Total time for this part is O(E).
        Combined with vertex processing, the total time is O(V + E).
    *   **Adjacency Matrix (as in provided C code):** When a vertex 'u' is dequeued, to find its neighbors, BFS iterates through the entire row corresponding to 'u' in the adjacency matrix. This takes O(V) time for each vertex. Since there are V vertices, this part takes O(V * V) = O(V²) time.

Therefore:
-   With an **Adjacency List**: O(V) (initialization + queue ops for vertices) + O(E) (edge traversals) = **O(V + E)**.
-   With an **Adjacency Matrix**: O(V) (initialization) + O(V) (queue ops for vertices) + O(V²) (edge traversals) = **O(V²)**.

### Space Complexity: O(V)

1.  **Visited Array:** An array of size V is needed to keep track of visited vertices: O(V).
2.  **Queue:** In the worst-case scenario (e.g., a star graph, or a graph where one node is connected to all others), the queue might hold up to O(V) vertices. For example, if the start node has V-1 neighbors, all of them will be enqueued. So, O(V).

The dominant factor is O(V).

## Notes on Provided C Code
- The C code uses an Adjacency Matrix (\\\`graph->adj[i][j]\\\`) for graph representation.
- The queue implementation is a simple array-based queue.
- The space complexity for the graph itself in the C code is O(MAX_VERTICES²), which is O(V²) if MAX_VERTICES is considered proportional to V.
    `,
  },
  code: "#include <stdio.h>\n#include <stdlib.h>\n\n#define MAX_VERTICES 100\n\n// Queue structure for BFS\ntypedef struct {\n    int items[MAX_VERTICES];\n    int front;\n    int rear;\n} Queue;\n\n// Create an empty queue\nQueue* createQueue() {\n    Queue* q = (Queue*)malloc(sizeof(Queue));\n    q->front = -1;\n    q->rear = -1;\n    return q;\n}\n\n// Check if the queue is empty\nint isEmpty(Queue* q) {\n    return q->rear == -1;\n}\n\n// Add an element to the queue\nvoid enqueue(Queue* q, int value) {\n    if (q->rear == MAX_VERTICES - 1)\n        printf(\"Queue is full!!\\n\");\n    else {\n        if (q->front == -1)\n            q->front = 0;\n        q->rear++;\n        q->items[q->rear] = value;\n    }\n}\n\n// Remove an element from the queue\nint dequeue(Queue* q) {\n    int item;\n    if (isEmpty(q)) {\n        printf(\"Queue is empty!!\\n\");\n        item = -1;\n    } else {\n        item = q->items[q->front];\n        q->front++;\n        if (q->front > q->rear) {\n            q->front = q->rear = -1;\n        }\n    }\n    return item;\n}\n\n// Graph structure: Adjacency Matrix\ntypedef struct {\n    int adj[MAX_VERTICES][MAX_VERTICES];\n    int numVertices;\n} Graph;\n\n// Create a graph\nGraph* createGraph(int vertices) {\n    Graph* graph = (Graph*)malloc(sizeof(Graph));\n    graph->numVertices = vertices;\n\n    for (int i = 0; i < vertices; i++) {\n        for (int j = 0; j < vertices; j++) {\n            graph->adj[i][j] = 0;\n        }\n    }\n    return graph;\n}\n\n// Add edge to an undirected graph\nvoid addEdge(Graph* graph, int src, int dest) {\n    graph->adj[src][dest] = 1;\n    graph->adj[dest][src] = 1;\n}\n\n// BFS algorithm\nvoid bfs(Graph* graph, int startVertex) {\n    Queue* q = createQueue();\n\n    int visited[MAX_VERTICES];\n    for (int i = 0; i < graph->numVertices; i++) {\n        visited[i] = 0;\n    }\n\n    visited[startVertex] = 1;\n    enqueue(q, startVertex);\n\n    printf(\"Breadth First Traversal (starting from vertex %d):\\n\", startVertex);\n\n    while (!isEmpty(q)) {\n        int currentVertex = dequeue(q);\n        printf(\"%d \", currentVertex);\n\n        for (int i = 0; i < graph->numVertices; i++) {\n            if (graph->adj[currentVertex][i] == 1 && visited[i] == 0) {\n                visited[i] = 1;\n                enqueue(q, i);\n            }\n        }\n    }\n    printf(\"\\n\");\n    free(q);\n}\n\nint main() {\n    int V, E, startNode;\n    printf(\"Enter the number of vertices (max %d): \", MAX_VERTICES);\n    scanf(\"%d\", &V);\n\n    if (V <= 0 || V > MAX_VERTICES) {\n        printf(\"Invalid number of vertices.\\n\");\n        return 1;\n    }\n\n    Graph* graph = createGraph(V);\n\n    printf(\"Enter the number of edges: \");\n    scanf(\"%d\", &E);\n\n    printf(\"Enter edges as pairs (src dest, 0-based index):\\n\");\n    for (int i = 0; i < E; i++) {\n        int src, dest;\n        scanf(\"%d %d\", &src, &dest);\n        if (src >= 0 && src < V && dest >= 0 && dest < V) {\n            addEdge(graph, src, dest);\n        } else {\n            printf(\"Invalid edge: (%d, %d). Vertices out of bound.\\n\", src, dest);\n            i--; \n        }\n    }\n\n    printf(\"Enter the starting node for BFS (0 to %d): \", V - 1);\n    scanf(\"%d\", &startNode);\n\n    if (startNode < 0 || startNode >= V) {\n        printf(\"Invalid starting node.\\n\");\n        free(graph);\n        return 1;\n    }\n\n    bfs(graph, startNode);\n\n    free(graph);\n    return 0;\n}",
}
