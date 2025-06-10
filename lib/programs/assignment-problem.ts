import type { Program } from "../types";

export const assignmentProblemProgram: Program = {
  id: "assignment-problem",
  name: "Assignment Problem (Branch & Bound)",
  description:
    "The Assignment Problem seeks to assign a set of tasks to a set of workers (or vice-versa) in a one-to-one manner such that the total cost of assignment is minimized. This implementation uses a Branch and Bound approach.",
  category: "Branch and Bound",
  examples: [
    {
      input: `Number of tasks/workers (N): 3\nCost Matrix:\n25 10 15\n10 30 5\n20 10 35`,
      output: "Optimal Assignments:\nWorker 0 -> Task 1 (Cost: 10)\nWorker 1 -> Task 2 (Cost: 5)\nWorker 2 -> Task 0 (Cost: 20)\nMinimum Total Cost: 35",
      explanation:
        "Assigning Worker 0 to Task 1, Worker 1 to Task 2, and Worker 2 to Task 0 gives the minimum total cost of 10 + 5 + 20 = 35.",
    },
  ],
  algorithmSteps: [
    "Initialize: Given an N x N cost matrix. 'min_total_cost' = infinity. 'best_assignment' = empty.",
    "State Representation: A node in the search tree can be (worker_index, current_assignment, current_cost, assigned_tasks_mask).",
    "Recursive Function (solve(worker_idx, current_assignment, current_cost, assigned_tasks_mask)):",
    "  1. Base Case: If worker_idx == N (all workers assigned):",
    "     If current_cost < min_total_cost, update min_total_cost = current_cost and store current_assignment as best_assignment.",
    "     Return.",
    "  2. Calculate Lower Bound (LB) for remaining assignments:",
    "     LB = current_cost + sum of minimum costs for each unassigned worker (from worker_idx to N-1) to an unassigned task.",
    "     For each unassigned worker 'w_i' (from worker_idx onwards), find min(cost[w_i][t_j]) for all unassigned tasks 't_j'. Sum these minimums.",
    "  3. Pruning: If LB >= min_total_cost, return (this path cannot lead to a better solution).",
    "  4. Iterate for current worker 'worker_idx' through all tasks 'task_j' (from 0 to N-1):",
    "     If task_j is not in 'assigned_tasks_mask':",
    "       Add assignment (worker_idx -> task_j) to current_assignment.",
    "       Recursively call: solve(worker_idx + 1, current_assignment, current_cost + cost[worker_idx][task_j], assigned_tasks_mask | (1 << task_j)).",
    "       Remove assignment (worker_idx -> task_j) from current_assignment (backtrack).",
    "Initial Call: solve(0, empty_assignment, 0, 0).",
  ],
  keyProperties: [
    "Systematically explores possible assignments using a state-space tree.",
    "Uses a lower bound function to estimate the minimum possible cost if the current partial assignment is extended.",
    "Prunes branches of the search tree that cannot lead to an optimal solution, reducing computation.",
    "Guarantees finding the optimal (minimum cost) assignment.",
    "The efficiency depends on the tightness of the lower bound and the order of exploration.",
  ],
  timeComplexity: {
    best: "O(N^2) if the first path explored after pruning is optimal and pruning is very effective.",
    average: "Highly variable, can be much better than worst-case depending on data and bounding function.",
    worst: "O(N! * N) in the worst case if bounding is ineffective (similar to brute-force enumeration of all N! permutations).",
    space: "O(N^2) for cost matrix, O(N) for recursion stack and storing assignments.",
    analysis: `
# Time Complexity Analysis for Assignment Problem (Branch and Bound)

## Overview
The Branch and Bound approach explores a state-space tree where each level represents assigning a worker to a task. The goal is to find the minimum cost assignment.

## State-Space Tree
- The tree depth is N (number of workers/tasks).
- At level k (assigning worker k), there are N-k available tasks to choose from if not using a mask properly, or iterating N tasks and checking availability.
- In the worst-case, without effective pruning, the algorithm might explore a large number of the N! possible complete assignments.

## Bounding Function
- At each node (partial assignment), a lower bound (LB) on the cost of any complete assignment achievable from this node is calculated.
- LB = (cost of current partial assignment) + (estimated minimum cost to assign remaining workers to remaining tasks).
- A common way to estimate the cost for remaining workers: for each unassigned worker, find the minimum cost to assign them to any *available* unassigned task. Sum these minimums.
- If LB >= current_best_total_cost_found, the current search path (branch) is pruned.

## Complexity Factors
- **Quality of Lower Bound**: A tighter (higher value) lower bound prunes more branches and improves performance.
- **Search Strategy**: The order in which nodes (partial assignments) are explored can affect when the optimal solution is found and how much pruning occurs.

## Worst-Case Time Complexity
- If the lower bound is not effective, the algorithm might explore most of the N! permutations.
- For each permutation, calculating its cost and performing checks takes O(N) or more (e.g. for bound calculation).
- Thus, the worst-case time complexity can be O(N * N!).

## Average-Case Time Complexity
- This is difficult to determine precisely and depends heavily on the specific cost matrix and the effectiveness of the bounding function.
- For many practical instances, Branch and Bound performs significantly better than its worst-case complexity.

## Space Complexity
- Storing the N x N cost matrix: O(N^2).
- Storing the current assignment and the best assignment found: O(N).
- Recursion stack depth: O(N) for the recursive implementation.
- Boolean array for tracking assigned tasks: O(N).
- Overall space complexity is typically dominated by O(N^2).
    `,
  },
  code: {
    c: `
#include <stdio.h>
#include <stdbool.h>
#include <limits.h>
#include <string.h>

#define MAX_N 10
#define INF INT_MAX

int n_ap;
int cost_matrix_ap[MAX_N][MAX_N];
int current_assignment_ap[MAX_N];
int final_assignment_ap[MAX_N];
bool task_assigned_ap[MAX_N];
int min_total_cost_ap = INF;

// This function is provided for context but not used in the final recursive solution below.
int calculate_lower_bound_ap(int worker_idx, int current_path_cost) {
    int bound = current_path_cost;
    for (int w = worker_idx; w < n_ap; w++) {
        int min_cost_for_worker = INF;
        for (int t = 0; t < n_ap; t++) {
            if (!task_assigned_ap[t]) {
                bool task_potentially_available = true;
                for(int prev_w = 0; prev_w < worker_idx; ++prev_w) {
                    if(current_assignment_ap[prev_w] == t) {
                        task_potentially_available = false;
                        break;
                    }
                }
                if (task_potentially_available && cost_matrix_ap[w][t] < min_cost_for_worker) {
                    min_cost_for_worker = cost_matrix_ap[w][t];
                }
            }
        }
        if (min_cost_for_worker == INF && worker_idx < n_ap) return INF;
        if (min_cost_for_worker != INF) bound += min_cost_for_worker;
    }
    return bound;
}

void solve_assignment_recursive(int worker_idx, int current_path_cost) {
    if (worker_idx == n_ap) {
        if (current_path_cost < min_total_cost_ap) {
            min_total_cost_ap = current_path_cost;
            for (int i = 0; i < n_ap; i++) {
                final_assignment_ap[i] = current_assignment_ap[i];
            }
        }
        return;
    }

    if (current_path_cost >= min_total_cost_ap) {
        return;
    }

    for (int task_idx = 0; task_idx < n_ap; task_idx++) {
        if (!task_assigned_ap[task_idx]) {
            task_assigned_ap[task_idx] = true;
            current_assignment_ap[worker_idx] = task_idx;
            
            int new_cost = current_path_cost + cost_matrix_ap[worker_idx][task_idx];

            if (new_cost < min_total_cost_ap) {
                 solve_assignment_recursive(worker_idx + 1, new_cost);
            }

            task_assigned_ap[task_idx] = false;
            current_assignment_ap[worker_idx] = -1;
        }
    }
}

int main() {
    printf("Enter the number of workers/tasks (N, max %d): ", MAX_N);
    scanf("%d", &n_ap);

    if (n_ap <= 0 || n_ap > MAX_N) {
        printf("Invalid N.\\n");
        return 1;
    }

    printf("Enter the cost matrix (%d x %d) for MINIMUM cost assignment:\\n", n_ap, n_ap);
    for (int i = 0; i < n_ap; i++) {
        for (int j = 0; j < n_ap; j++) {
            scanf("%d", &cost_matrix_ap[i][j]);
             if (cost_matrix_ap[i][j] == 99999) cost_matrix_ap[i][j] = INF;
        }
    }

    memset(task_assigned_ap, false, sizeof(task_assigned_ap));
    memset(current_assignment_ap, -1, sizeof(current_assignment_ap));
    min_total_cost_ap = INF;

    solve_assignment_recursive(0, 0);

    if (min_total_cost_ap == INF) {
        printf("No valid assignment found or error in input.\\n");
    } else {
        printf("Optimal Assignments:\\n");
        for (int i = 0; i < n_ap; i++) {
            printf("Worker %d -> Task %d (Cost: %d)\\n", i, final_assignment_ap[i], cost_matrix_ap[i][final_assignment_ap[i]]);
        }
        printf("Minimum Total Cost: %d\\n", min_total_cost_ap);
    }

    return 0;
}
`,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

#define INF INT_MAX

int n_ap;
vector<vector<int>> cost_matrix_ap;
vector<int> current_assignment_ap;
vector<int> final_assignment_ap;
vector<bool> task_assigned_ap;
int min_total_cost_ap = INF;

void solve_assignment_recursive(int worker_idx, int current_path_cost) {
    if (worker_idx == n_ap) {
        if (current_path_cost < min_total_cost_ap) {
            min_total_cost_ap = current_path_cost;
            final_assignment_ap = current_assignment_ap;
        }
        return;
    }

    if (current_path_cost >= min_total_cost_ap) {
        return;
    }

    for (int task_idx = 0; task_idx < n_ap; task_idx++) {
        if (!task_assigned_ap[task_idx]) {
            task_assigned_ap[task_idx] = true;
            current_assignment_ap[worker_idx] = task_idx;
            
            int new_cost = current_path_cost + cost_matrix_ap[worker_idx][task_idx];

            if (new_cost < min_total_cost_ap) {
                 solve_assignment_recursive(worker_idx + 1, new_cost);
            }

            task_assigned_ap[task_idx] = false;
        }
    }
}

int main() {
    cout << "Enter the number of workers/tasks (N): ";
    cin >> n_ap;

    if (n_ap <= 0) {
        cout << "Invalid N." << endl;
        return 1;
    }

    cost_matrix_ap.assign(n_ap, vector<int>(n_ap));
    cout << "Enter the cost matrix (" << n_ap << " x " << n_ap << ") for MINIMUM cost assignment:" << endl;
    for (int i = 0; i < n_ap; i++) {
        for (int j = 0; j < n_ap; j++) {
            cin >> cost_matrix_ap[i][j];
            if (cost_matrix_ap[i][j] == 99999) cost_matrix_ap[i][j] = INF;
        }
    }

    task_assigned_ap.assign(n_ap, false);
    current_assignment_ap.assign(n_ap, -1);
    min_total_cost_ap = INF;

    solve_assignment_recursive(0, 0);

    if (min_total_cost_ap == INF) {
        cout << "No valid assignment found or error in input." << endl;
    } else {
        cout << "Optimal Assignments:" << endl;
        for (int i = 0; i < n_ap; i++) {
            cout << "Worker " << i << " -> Task " << final_assignment_ap[i] 
                      << " (Cost: " << cost_matrix_ap[i][final_assignment_ap[i]] << ")" << endl;
        }
        cout << "Minimum Total Cost: " << min_total_cost_ap << endl;
    }

    return 0;
}
`
  },
sampleInput: "Number of tasks/workers (N): 3\nCost Matrix:\n25 10 15\n10 30 5\n20 10 35",
};
