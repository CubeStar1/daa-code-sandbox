import type { Program } from "../types";

export const tspProgram: Program = {
  id: "tsp",
  name: "Traveling Salesperson Problem (Branch & Bound)",
  description:
    "The Traveling Salesperson Problem (TSP) asks for the shortest possible route that visits each city exactly once and returns to the origin city. This implementation uses a Branch and Bound approach.",
  category: "Branch and Bound",
  examples: [
    {
      input: `Number of cities: 4\nDistance Matrix:\n0 10 15 20\n10 0 35 25\n15 35 0 30\n20 25 30 0`,
      output: "Minimum cost of the TSP tour: 80\nPath: 0 -> 1 -> 3 -> 2 -> 0",
      explanation:
        "Given 4 cities and their distances, the algorithm finds the shortest tour. One such tour is 0-1-3-2-0 with cost 10+25+30+15 = 80.",
    },
  ],
  algorithmSteps: [
    "Represent the problem as a state-space tree. Each node in the tree represents a partial tour.",
    "Start with a root node representing the starting city and a path cost of 0.",
    "Maintain a variable 'min_cost' initialized to infinity, storing the cost of the best tour found so far.",
    "Recursively explore the state-space tree:",
    "  At each node (current city 'u', current path 'path', current cost 'curr_cost', visited cities 'visited'):",
    "    1. Calculate a Lower Bound (LB) for any tour that can be completed from this partial tour.",
    "       A simple LB = curr_cost + sum of minimum outgoing edge costs from unvisited cities + cost of minimum edge from last unvisited city back to start.",
    "       A more common LB used in practice: For each unvisited city 'i', find the sum of the two smallest edges connected to 'i'. Sum these values for all unvisited cities, divide by 2. Add this to curr_cost and the cost of edges in the current path.",
    "    2. Pruning: If LB >= min_cost, prune this branch (do not explore further from this node) because it cannot lead to a better solution.",
    "    3. For each unvisited city 'v' adjacent to 'u':",
    "       Mark 'v' as visited.",
    "       Recursively call the function for city 'v', updating path, curr_cost + dist[u][v], and visited set.",
    "       Unmark 'v' (backtrack) to allow other paths.",
    "    4. Base Case: If all cities have been visited:",
    "       Add the cost of returning from the current city to the starting city.",
    "       If this total tour cost is less than 'min_cost', update 'min_cost' and store this path as the best path found.",
    "The initial call starts from city 0, with city 0 visited, and current cost 0.",
  ],
  keyProperties: [
    "Uses a state-space tree search to find the optimal solution.",
    "Employs a bounding function to estimate the minimum possible cost of completing a tour from a partial solution.",
    "Prunes subtrees that cannot lead to a solution better than the current best known, significantly reducing the search space compared to brute force.",
    "The efficiency heavily depends on the quality of the lower bound function.",
    "Guarantees finding the optimal solution.",
  ],
  timeComplexity: {
    best: "O(N^2) if the first path explored after pruning is optimal and pruning is very effective.",
    average: "Highly variable, depends on data and bounding function. Can be much better than worst-case.",
    worst: "O(N! * N) or O((N-1)!) in the worst case if bounding is ineffective (similar to brute force enumeration of paths).",
    space: "O(N^2) for storing the distance matrix and O(N) for recursion stack and path storage.",
    analysis: `
# Time Complexity Analysis for TSP (Branch and Bound)

## Overview
Branch and Bound for TSP explores a state-space tree. The root represents the starting city, and paths down the tree represent partial tours.

## State-Space Tree
- In the worst case, the algorithm might explore a significant portion of the (N-1)! possible Hamiltonian cycles.
- Each node expansion involves iterating through up to N-k cities (where k is the current path length).

## Bounding Function
- A lower bound (LB) is calculated at each node.
- If LB >= current_minimum_tour_cost, the subtree rooted at that node is pruned.
- The effectiveness of pruning dictates the practical performance.

## Complexity Factors
- **Quality of Lower Bound**: A tighter (higher) lower bound leads to more pruning and better performance.
  - Simple bounds (like sum of minimum edges from unvisited nodes) are easy to compute but might not prune much.
  - More complex bounds (e.g., based on minimum 1-trees or assignment problem relaxation) can be more effective but costlier to compute.
- **Order of Node Exploration**: Heuristics for choosing which node to expand next (e.g., least lower bound) can influence when the optimal solution is found.

## Worst-Case Time Complexity
- If the bounding function is not effective or the problem instance is structured such that pruning occurs late, the algorithm might degenerate to exploring almost all (N-1)! permutations.
- For each permutation, calculating its cost takes O(N).
- So, a loose upper bound on worst-case time is O(N * N!) or O(N!).

## Average-Case Time Complexity
- Difficult to determine analytically; highly dependent on the problem instance and the specific Branch and Bound strategy (bounding function, search strategy).
- Generally performs much better than the worst-case for many typical instances.

## Space Complexity
- Storing the distance matrix: O(N^2).
- Recursion stack depth: O(N).
- Storing the current path and visited array: O(N).
- If a priority queue is used to manage active nodes (e.g., in a least-cost Branch and Bound), its size can be large in the worst case, potentially O(N!). However, recursive implementations typically use implicit stack space.
- Overall practical space is often dominated by O(N^2).
    `,
  },
  code: `
#include <stdio.h>
#include <limits.h>
#include <stdbool.h>
#include <string.h>

#define MAX_N 10
#define INF INT_MAX

int n_tsp;
int cost_matrix_tsp[MAX_N][MAX_N];

int final_path_tsp[MAX_N + 1];
bool visited_tsp[MAX_N];
int min_tsp_cost = INF;

void copyToFinal(int curr_path[]) {
    for (int i = 0; i < n_tsp; i++) {
        final_path_tsp[i] = curr_path[i];
    }
    final_path_tsp[n_tsp] = curr_path[0];
}

int calculateLowerBound(int curr_cost, int level, int curr_path[]) {
    int bound = curr_cost;
    bool temp_visited[MAX_N];
    memcpy(temp_visited, visited_tsp, n_tsp * sizeof(bool));

    for (int i = 0; i < n_tsp; i++) {
        if (!temp_visited[i]) {
            int min_edge = INF;
        }
    }
    return bound; 
}

void TSP_recursion(int curr_node, int level, int curr_cost, int curr_path[]) {
    if (level == n_tsp) {
        if (cost_matrix_tsp[curr_node][curr_path[0]] != 0 && cost_matrix_tsp[curr_node][curr_path[0]] != INF) {
            int total_cost = curr_cost + cost_matrix_tsp[curr_node][curr_path[0]];
            if (total_cost < min_tsp_cost) {
                min_tsp_cost = total_cost;
                copyToFinal(curr_path);
            }
        }
        return;
    }

    for (int next_node = 0; next_node < n_tsp; next_node++) {
        if (!visited_tsp[next_node] && cost_matrix_tsp[curr_node][next_node] != 0 && cost_matrix_tsp[curr_node][next_node] != INF) {
            if (curr_cost + cost_matrix_tsp[curr_node][next_node] >= min_tsp_cost) {
                 if (level < n_tsp -1) continue;
            }

            visited_tsp[next_node] = true;
            curr_path[level] = next_node;
            TSP_recursion(next_node, level + 1, curr_cost + cost_matrix_tsp[curr_node][next_node], curr_path);
            
            visited_tsp[next_node] = false;
        }
    }
}

int main() {
    printf("Enter the number of cities (max %d): ", MAX_N);
    scanf("%d", &n_tsp);

    if (n_tsp <= 0 || n_tsp > MAX_N) {
        printf("Invalid number of cities.\\n");
        return 1;
    }

    printf("Enter the cost matrix (%d x %d):\\n", n_tsp, n_tsp);
    printf("(Use 0 for same city, or a large number like 99999 for no direct path/infinity):\\n");
    for (int i = 0; i < n_tsp; i++) {
        for (int j = 0; j < n_tsp; j++) {
            scanf("%d", &cost_matrix_tsp[i][j]);
            if (cost_matrix_tsp[i][j] == 0 && i != j) {
            }
            if (cost_matrix_tsp[i][j] == 99999) cost_matrix_tsp[i][j] = INF;
        }
    }

    memset(visited_tsp, false, sizeof(visited_tsp));
    int initial_path[MAX_N + 1];
    memset(initial_path, -1, sizeof(initial_path));

    visited_tsp[0] = true;
    initial_path[0] = 0;
    min_tsp_cost = INF;

    TSP_recursion(0, 1, 0, initial_path);

    if (min_tsp_cost == INF) {
        printf("No Hamiltonian cycle found or error in input.\\n");
    } else {
        printf("Minimum cost of the TSP tour: %d\\n", min_tsp_cost);
        printf("Path: ");
        for (int i = 0; i <= n_tsp; i++) {
            printf("%d", final_path_tsp[i]);
            if (i < n_tsp) {
                printf(" -> ");
            }
        }
        printf("\\n");
    }

    return 0;
}
  `,
};
