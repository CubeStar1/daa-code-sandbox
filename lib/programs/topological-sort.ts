import type { Program } from "../types"

export const topologicalSortProgram: Program = {
  id: "topological-sort",
  name: "Topological Sort (DFS based)",
  description:
    "A linear ordering of vertices such that for every directed edge from vertex u to vertex v, u comes before v in the ordering. This implementation uses Depth-First Search (DFS) and is only for Directed Acyclic Graphs (DAGs).",
  category: "Decrease and Conquer",
  examples: [
    {
      input: "6\n6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1",
      output: "Topological Sort (DFS based):\n5 4 2 3 1 0 ",
      explanation:
        "A valid topological sort for the given DAG using a DFS-based approach. The exact output can vary based on the traversal order.",
    },
    {
      input: "3\n3\n0 1\n1 2\n2 0",
      output: "Topological Sort (DFS based):\n0 1 2 ",
      explanation: "This implementation does not detect cycles. For a cyclic graph, it will produce an ordering, but it will not be a valid topological sort.",
    },
  ],
  algorithmSteps: [
    "Initialize a stack to store the topologically sorted vertices.",
    "Initialize a 'visited' array to keep track of visited vertices.",
    "For each vertex 'u' in the graph:",
    "  If 'u' has not been visited, call a recursive DFS helper function on 'u'.",
    "In the DFS helper function for vertex 'u':",
    "  Mark 'u' as visited.",
    "  For each neighbor 'v' of 'u' (where there is an edge from u to v):",
    "    If 'v' has not been visited, recursively call the DFS helper on 'v'.",
    "  After visiting all neighbors, push 'u' onto the stack.",
    "After the main loop finishes, the contents of the stack, when popped one by one, give the topological sort.",
  ],
  keyProperties: [
    "Applicable only to Directed Acyclic Graphs (DAGs).",
    "This implementation uses a recursive, DFS-based approach.",
    "The basic version shown here does not detect cycles.",
    "The resulting order depends on the starting points of the DFS and the order of neighbor traversal.",
  ],
  timeComplexity: {
    best: "O(V^2)",
    average: "O(V^2)",
    worst: "O(V^2)",
    space: "O(V^2) for adjacency matrix, O(V) for auxiliary space (visited array and recursion stack).",
    analysis: `
# Time and Space Complexity Analysis for Topological Sort (DFS-based with Adjacency Matrix)

## Time Complexity: O(V²)

1.  **DFS Traversal**: The core of the algorithm is a Depth-First Search (DFS).
2.  **Vertex Visitation**: Each vertex is visited exactly once. The main loop iterates through all V vertices, and the recursive helper function ensures that it only processes unvisited vertices.
3.  **Neighbor Discovery**: When visiting a vertex \`u\`, the algorithm needs to find all its neighbors. With an **adjacency matrix**, this requires scanning the entire row for \`u\`, which takes O(V) time.
4.  **Total Time**: Since the O(V) neighbor discovery process is performed for each of the V vertices, the total time complexity is V * O(V) = **O(V²)**.

If an adjacency list were used, the time complexity would be O(V + E).

## Space Complexity

1.  **Adjacency Matrix**: Storing the graph itself requires O(V²) space.
2.  **Visited Array**: An array of size V is needed, which is O(V) space.
3.  **Recursion Stack**: The depth of the recursion can be at most V, contributing O(V) to the space complexity.
4.  **Output Stack**: The stack used to store the sorted vertices will hold all V vertices, requiring O(V) space.

The auxiliary space complexity (excluding the input graph) is O(V). The total space complexity including the graph representation is **O(V²)**.
    `,
  },
  code: {
    c: `
#include <stdio.h>

#define MAX 100
int adj[MAX][MAX];
int visited[MAX];
int stack[MAX];
int top = -1;

// Function declarations
void addEdge(int u, int v);
void topoSort(int n);
void dfs(int u, int n);

int main() {
    int n, e;
    printf("Enter number of vertices: \\n");
    scanf("%d", &n);
    printf("Enter number of edges: \\n");
    scanf("%d", &e);

    // Initialize arrays
    for (int i = 0; i < n; i++) {
        visited[i] = 0;
        for (int j = 0; j < n; j++)
            adj[i][j] = 0;
    }

    for (int i = 0; i < e; i++) {
        int u, v;
        printf("Enter edge (u v): \\n");
        scanf("%d %d", &u, &v);
        addEdge(u, v);
    }

    topoSort(n);

    return 0;
}

void addEdge(int u, int v) {
    adj[u][v] = 1;
}

void topoSort(int n) {
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            dfs(i, n);
        }
    }

    printf("Topo: ");
    while (top >= 0)
        printf("%d ", stack[top--]);
    printf("\\n");
}

void dfs(int u, int n) {
    visited[u] = 1;
    for (int v = 0; v < n; v++) {
        if (adj[u][v] && !visited[v])
            dfs(v, n);
    }
    stack[++top] = u;
}
`,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

int main() {
    int V, E;
    cout << "Enter number of vertices: " << endl;
    cin >> V;

    if (V <= 0) {
        cout << "Invalid number of vertices" << endl;
        return 1;
    }

    vector<vector<int>> adj(V);
    vector<int> indeg(V, 0);

    cout << "Enter number of directed edges: " << endl;
    cin >> E;

    cout << "Enter edges as pairs: src dest (0-based labels)" << endl;
    for (int i = 0; i < E; ++i) {
        int u, v;
        cin >> u >> v;
        if (u >= 0 && u < V && v >= 0 && v < V) {
            adj[u].push_back(v);
            indeg[v]++;
        }
    }

    queue<int> q;
    for (int i = 0; i < V; ++i) {
        if (indeg[i] == 0) {
            q.push(i);
        }
    }

    vector<int> top_order;
    int visited_count = 0;

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        top_order.push_back(u);
        visited_count++;

        for (int v : adj[u]) {
            indeg[v]--;
            if (indeg[v] == 0) {
                q.push(v);
        }
        }
    }

    if (visited_count != V) {
        cout << "Graph has a cycle! No topological ordering." << endl;
    } else {
        cout << "Topological order:" << endl;
        for (int i = 0; i < top_order.size(); ++i) {
            cout << top_order[i] << (i == top_order.size() - 1 ? "" : " ");
        }
        cout << endl;
    }

    return 0;
}
`
  },
  sampleInput: "6\n6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1"
}

