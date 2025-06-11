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
  sampleInput: "7\n8\n0 1\n0 2\n1 3\n1 4\n2 5\n2 6\n3 4\n5 6\n0",
  code: {
    c: `
#include <stdio.h>
#include <stdlib.h>

#define MAX_VERTICES 100

typedef struct {
    int items[MAX_VERTICES];
    int front;
    int rear;
} Queue;

Queue* createQueue() {
    Queue* q = (Queue*)malloc(sizeof(Queue));
    q->front = -1;
    q->rear = -1;
    return q;
}

int isEmpty(Queue* q) {
    return q->rear == -1;
}
void enqueue(Queue* q, int value) {
    if (q->rear == MAX_VERTICES - 1)
        printf("Queue is full!!\\n");
    else {
        if (q->front == -1)
            q->front = 0;
        q->rear++;
        q->items[q->rear] = value;
    }
}

int dequeue(Queue* q) {
    int item;
    if (isEmpty(q)) {
        printf("Queue is empty!!\\n");
        item = -1;
    } else {
        item = q->items[q->front];
        q->front++;
        if (q->front > q->rear) {
            q->front = q->rear = -1;
        }
    }
    return item;
}

typedef struct {
    int adj[MAX_VERTICES][MAX_VERTICES];
    int numVertices;
} Graph;
Graph* createGraph(int vertices) {
    Graph* graph = (Graph*)malloc(sizeof(Graph));
    graph->numVertices = vertices;

    for (int i = 0; i < vertices; i++) {
        for (int j = 0; j < vertices; j++) {
            graph->adj[i][j] = 0;
        }
    }
    return graph;
}

void addEdge(Graph* graph, int src, int dest) {
    graph->adj[src][dest] = 1;
    graph->adj[dest][src] = 1;
}

void bfs(Graph* graph, int startVertex) {
    Queue* q = createQueue();

    int visited[MAX_VERTICES];
    for (int i = 0; i < graph->numVertices; i++) {
        visited[i] = 0;
    }

    visited[startVertex] = 1;
    enqueue(q, startVertex);

    printf("Breadth First Traversal (starting from vertex %d):\\n", startVertex);

    while (!isEmpty(q)) {
        int currentVertex = dequeue(q);
        printf("%d ", currentVertex);

        for (int i = 0; i < graph->numVertices; i++) {
            if (graph->adj[currentVertex][i] == 1 && visited[i] == 0) {
                visited[i] = 1;
                enqueue(q, i);
            }
        }
    }
    printf("\\n");
    free(q);
}

int main() {
    int V, E, startNode;
    printf("Enter the number of vertices (max %d): \\n", MAX_VERTICES);
    scanf("%d", &V);

    if (V <= 0 || V > MAX_VERTICES) {
        printf("Invalid number of vertices.\\n");
        return 1;
    }

    Graph* graph = createGraph(V);

    printf("Enter the number of edges: \\n");
    scanf("%d", &E);

    printf("Enter edges as pairs (src dest, 0-based index):\\n");
    for (int i = 0; i < E; i++) {
        int src, dest;
        scanf("%d %d", &src, &dest);
        if (src >= 0 && src < V && dest >= 0 && dest < V) {
            addEdge(graph, src, dest);
        } else {
            printf("Invalid edge: (%d, %d). Vertices out of bound.\\n", src, dest);
            i--;
        }
    }

    printf("Enter the starting node for BFS (0 to %d): \\n", V - 1);
    scanf("%d", &startNode);

    if (startNode < 0 || startNode >= V) {
        printf("Invalid starting node.\\n");
        free(graph);
        return 1;
    }

    bfs(graph, startNode);

    free(graph);
    return 0;
}
`,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

class Graph {
    int V;
    vector<vector<int>> adj;

public:
    Graph(int V) : V(V), adj(V) {}

    void addEdge(int v, int w) {
        adj[v].push_back(w);
        adj[w].push_back(v); 
    }

    void BFS(int s) {
        vector<bool> visited(V, false);
        queue<int> q;

        visited[s] = true;
        q.push(s);

        cout << "Breadth First Traversal (starting from vertex " << s << "):" << endl;

        while (!q.empty()) {
            s = q.front();
            cout << s << " ";
            q.pop();

            for (int adjacent : adj[s]) {
                if (!visited[adjacent]) {
                    visited[adjacent] = true;
                    q.push(adjacent);
                }
            }
        }
        cout << endl;
    }
};

int main() {
    int V, E, startNode;
    cout << "Enter the number of vertices: ";
    cin >> V;

    if (V <= 0) {
        cout << "Invalid number of vertices." << endl;
        return 1;
    }

    Graph g(V);

    cout << "Enter the number of edges: ";
    cin >> E;

    cout << "Enter the edges (format: u v):" << endl;
    for (int i = 0; i < E; ++i) {
        int u, v;
        cin >> u >> v;
        g.addEdge(u, v);
    }

    cout << "Enter the starting vertex for BFS: ";
    cin >> startNode;

    if (startNode >= 0 && startNode < V) {
        g.BFS(startNode);
    } else {
        std::cout << "Invalid starting vertex." << std::endl;
    }

    return 0;
}
`,
    },
}
