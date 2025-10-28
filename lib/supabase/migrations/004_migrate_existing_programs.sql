-- Migration: Convert existing programs to new problem schema
-- Created: 2025-09-06
-- Run this script to migrate your existing programs to the new LeetCode-style schema

-- This script should be run after the main schema migrations
-- It will convert your existing Program data structure to the new Problem format

-- First, let's create a temporary function to help with the migration
CREATE OR REPLACE FUNCTION migrate_programs_to_problems()
RETURNS TABLE (
    migrated_count INTEGER,
    errors TEXT[]
) 
LANGUAGE plpgsql
AS $$
DECLARE
    program_record RECORD;
    new_problem_id UUID;
    category_id UUID;
    error_messages TEXT[] := '{}';
    success_count INTEGER := 0;
BEGIN
    -- This is a placeholder function since we don't have direct access to your TypeScript programs
    -- You'll need to run the actual migration from your application code
    
    -- Example of how the migration would work:
    -- 1. Read each program from your TypeScript files
    -- 2. Convert using MigrationService.convertProgramToProblem()
    -- 3. Insert into problems table
    -- 4. Create test cases from examples
    -- 5. Create editorial from algorithm steps and complexity analysis
    
    RAISE NOTICE 'Migration function created. Run the migration from your Node.js/TypeScript code.';
    
    RETURN QUERY SELECT 0 as migrated_count, error_messages as errors;
END;
$$;

-- Create some additional helper categories for your algorithm types
INSERT INTO problem_categories (name, slug, description) VALUES
('Brute Force', 'brute-force', 'Problems solvable with brute force approaches'),
('Divide and Conquer', 'divide-and-conquer', 'Problems using divide and conquer strategy'),
('Transform and Conquer', 'transform-and-conquer', 'Transform and conquer algorithm problems'),
('Space Time Tradeoffs', 'space-time-tradeoffs', 'Problems involving space-time complexity tradeoffs'),
('Network Flow', 'network-flow', 'Network flow and graph optimization problems'),
('String Algorithms', 'string-algorithms', 'Advanced string processing algorithms'),
('Geometric Algorithms', 'geometric-algorithms', 'Computational geometry problems'),
('Number Theory', 'number-theory', 'Number theory and mathematical problems')
ON CONFLICT (slug) DO NOTHING;

-- Create a mapping table for your old categories to new ones
CREATE TEMP TABLE category_mapping AS
SELECT * FROM (VALUES
    ('Brute Force', 'brute-force'),
    ('Recursive', 'recursive'),
    ('Divide and Conquer', 'divide-and-conquer'),
    ('Decrease and Conquer', 'divide-and-conquer'),
    ('Transform and Conquer', 'transform-and-conquer'),
    ('Space and Time Tradeoffs', 'space-time-tradeoffs'),
    ('Dynamic Programming', 'dynamic-programming'),
    ('Greedy Technique', 'greedy'),
    ('Backtracking', 'backtracking'),
    ('Branch and Bound', 'backtracking')
) AS t(old_category, new_slug);

-- Add some indexes that might be helpful during migration
CREATE INDEX IF NOT EXISTS idx_problems_migration_temp ON problems(title, slug);

-- Function to determine difficulty based on algorithm complexity
CREATE OR REPLACE FUNCTION get_difficulty_from_category(category_name TEXT)
RETURNS difficulty_level
LANGUAGE plpgsql
AS $$
BEGIN
    CASE category_name
        WHEN 'Brute Force' THEN RETURN 'easy';
        WHEN 'Recursive' THEN RETURN 'easy';
        WHEN 'Greedy Technique' THEN RETURN 'medium';
        WHEN 'Dynamic Programming' THEN RETURN 'hard';
        WHEN 'Branch and Bound' THEN RETURN 'hard';
        WHEN 'Backtracking' THEN RETURN 'hard';
        WHEN 'Divide and Conquer' THEN RETURN 'medium';
        WHEN 'Space and Time Tradeoffs' THEN RETURN 'medium';
        ELSE RETURN 'medium';
    END CASE;
END;
$$;

-- Sample migration for one specific program (Assignment Problem)
-- This shows the pattern you should follow for each program
DO $$
DECLARE
    assignment_problem_id UUID;
    backtracking_cat_id UUID;
    editorial_id UUID;
BEGIN
    -- Get the backtracking category ID
    SELECT id INTO backtracking_cat_id 
    FROM problem_categories 
    WHERE slug = 'backtracking';
    
    -- Insert the assignment problem
    INSERT INTO problems (
        id,
        title,
        slug,
        description,
        difficulty,
        constraints,
        hints,
        is_published,
        time_limit_ms,
        memory_limit_mb
    ) VALUES (
        uuid_generate_v4(),
        'Assignment Problem (Branch & Bound)',
        'assignment-problem-branch-bound',
        '# Assignment Problem (Branch & Bound)

The Assignment Problem seeks to assign a set of tasks to a set of workers (or vice-versa) in a one-to-one manner such that the total cost of assignment is minimized. This implementation uses a Branch and Bound approach.

This is a classic optimization problem that can be solved using various algorithms. The Branch and Bound approach systematically explores the solution space while pruning branches that cannot lead to optimal solutions.

## Problem Statement

Given an N×N cost matrix where `cost[i][j]` represents the cost of assigning worker `i` to task `j`, find the assignment that minimizes the total cost.

## Constraints

- Each worker must be assigned exactly one task
- Each task must be assigned exactly one worker
- Minimize the total assignment cost',
        'hard',
        '- 1 ≤ N ≤ 20 (number of workers/tasks)
- 1 ≤ cost[i][j] ≤ 1000
- All costs are positive integers',
        ARRAY[
            'Think about how to represent the state space of partial assignments',
            'Consider how to calculate a lower bound for remaining assignments',
            'Use pruning to eliminate branches that cannot lead to optimal solutions'
        ],
        true,
        5000, -- 5 seconds for complex algorithm
        512   -- 512 MB memory limit
    )
    RETURNING id INTO assignment_problem_id;
    
    -- Link to category
    INSERT INTO problem_category_relations (problem_id, category_id)
    VALUES (assignment_problem_id, backtracking_cat_id);
    
    -- Add test cases
    INSERT INTO problem_test_cases (problem_id, input, expected_output, is_example, order_index) VALUES
    (assignment_problem_id, '3
25 10 15
10 30 5
20 10 35', 'Minimum Total Cost: 35
Optimal Assignments:
Worker 0 -> Task 1 (Cost: 10)
Worker 1 -> Task 2 (Cost: 5)
Worker 2 -> Task 0 (Cost: 20)', true, 1),
    
    (assignment_problem_id, '2
1 2
3 4', 'Minimum Total Cost: 5
Optimal Assignments:
Worker 0 -> Task 0 (Cost: 1)
Worker 1 -> Task 1 (Cost: 4)', true, 2),
    
    (assignment_problem_id, '4
9 2 7 8
6 4 3 7
5 8 1 8
7 6 9 4', 'Minimum Total Cost: 13', false, 3);
    
    -- Create editorial
    INSERT INTO problem_editorials (
        problem_id,
        approach_title,
        approach_description,
        intuition,
        algorithm_steps,
        complexity_analysis,
        code_solutions,
        is_official
    ) VALUES (
        assignment_problem_id,
        'Branch and Bound Approach',
        'Use a systematic tree search with intelligent pruning to find the optimal assignment while avoiding exploration of suboptimal solution branches.',
        'The brute force approach would enumerate all N! possible assignments, which is prohibitively expensive. Branch and Bound improves on this by:

1. **Systematic Exploration**: Build assignments one worker at a time
2. **Lower Bound Calculation**: Estimate the minimum possible cost for any complete assignment extending the current partial assignment
3. **Pruning**: Eliminate branches where the lower bound exceeds the best known solution

The key insight is that if we can prove a partial assignment cannot lead to a better solution than what we''ve already found, we can skip exploring that entire subtree.',
        '## Algorithm Steps

1. **Initialize**: Set `min_total_cost = ∞` and `best_assignment = empty`

2. **State Representation**: Each node represents `(worker_index, current_assignment, current_cost, assigned_tasks_mask)`

3. **Recursive Function**: `solve(worker_idx, current_assignment, current_cost, assigned_tasks_mask)`
   - **Base Case**: If `worker_idx == N` (all workers assigned):
     - If `current_cost < min_total_cost`, update best solution
     - Return
   
   - **Calculate Lower Bound**: 
     - `LB = current_cost + estimated_remaining_cost`
     - For each unassigned worker, find minimum cost to any unassigned task
     - Sum these minimums as optimistic estimate
   
   - **Pruning**: If `LB ≥ min_total_cost`, return (cannot improve)
   
   - **Branch**: For each unassigned task `j`:
     - Add assignment `worker_idx → task_j`
     - Recursively solve for `worker_idx + 1`
     - Backtrack (remove assignment)

4. **Initial Call**: `solve(0, empty_assignment, 0, 0)`',
        '## Time Complexity

- **Best Case**: O(N²) when pruning is very effective and optimal path is found early
- **Average Case**: Highly variable, often much better than worst case due to pruning
- **Worst Case**: O(N! × N) if pruning is ineffective (degrades to brute force)

## Space Complexity

- **Memory**: O(N²) for cost matrix + O(N) for recursion stack and assignments
- **Overall**: O(N²)

## Key Optimizations

1. **Tight Lower Bound**: Better bounds lead to more pruning
2. **Search Order**: Exploring promising branches first improves pruning
3. **State Representation**: Efficient tracking of assigned tasks (bitmask)

The effectiveness heavily depends on the problem instance and bound quality.',
        '{"cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\n#define INF INT_MAX\n\nint n_ap;\nvector<vector<int>> cost_matrix_ap;\nvector<int> current_assignment_ap;\nvector<int> final_assignment_ap;\nvector<bool> task_assigned_ap;\nint min_total_cost_ap = INF;\n\nvoid solve_assignment_recursive(int worker_idx, int current_path_cost) {\n    if (worker_idx == n_ap) {\n        if (current_path_cost < min_total_cost_ap) {\n            min_total_cost_ap = current_path_cost;\n            final_assignment_ap = current_assignment_ap;\n        }\n        return;\n    }\n\n    if (current_path_cost >= min_total_cost_ap) {\n        return;\n    }\n\n    for (int task_idx = 0; task_idx < n_ap; task_idx++) {\n        if (!task_assigned_ap[task_idx]) {\n            task_assigned_ap[task_idx] = true;\n            current_assignment_ap[worker_idx] = task_idx;\n            \n            int new_cost = current_path_cost + cost_matrix_ap[worker_idx][task_idx];\n\n            if (new_cost < min_total_cost_ap) {\n                 solve_assignment_recursive(worker_idx + 1, new_cost);\n            }\n\n            task_assigned_ap[task_idx] = false;\n        }\n    }\n}\n\nint main() {\n    cout << \"Enter the number of workers/tasks (N): \\n\";\n    cin >> n_ap;\n\n    if (n_ap <= 0) {\n        cout << \"Invalid N.\" << endl;\n        return 1;\n    }\n\n    cost_matrix_ap.assign(n_ap, vector<int>(n_ap));\n    cout << \"Enter the cost matrix (\" << n_ap << \" x \" << n_ap << \"):\" << endl;\n    for (int i = 0; i < n_ap; i++) {\n        for (int j = 0; j < n_ap; j++) {\n            cin >> cost_matrix_ap[i][j];\n        }\n    }\n\n    task_assigned_ap.assign(n_ap, false);\n    current_assignment_ap.assign(n_ap, -1);\n    min_total_cost_ap = INF;\n\n    solve_assignment_recursive(0, 0);\n\n    if (min_total_cost_ap == INF) {\n        cout << \"No valid assignment found.\" << endl;\n    } else {\n        cout << \"Minimum Total Cost: \" << min_total_cost_ap << endl;\n        cout << \"Optimal Assignments:\" << endl;\n        for (int i = 0; i < n_ap; i++) {\n            cout << \"Worker \" << i << \" -> Task \" << final_assignment_ap[i] \n                      << \" (Cost: \" << cost_matrix_ap[i][final_assignment_ap[i]] << \")\" << endl;\n        }\n    }\n\n    return 0;\n}", "c": "#include <stdio.h>\n#include <limits.h>\n\n#define N 10\n\nint n;\nint cost[N][N];\nint visited[N];\nint minCost = INT_MAX;\n\nvoid assignTasks(int level, int currentCost) {\n    if (level == n) {\n        if (currentCost < minCost)\n            minCost = currentCost;\n        return;\n    }\n\n    for (int i = 0; i < n; i++) {\n        if (!visited[i]) {\n            visited[i] = 1;\n            assignTasks(level + 1, currentCost + cost[level][i]);\n            visited[i] = 0;\n        }\n    }\n}\n\nint main() {\n    printf(\"Enter number of agents/tasks: \\n\");\n    scanf(\"%d\", &n);\n\n    printf(\"Enter cost matrix (%d x %d):\\n\", n, n);\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < n; j++)\n            scanf(\"%d\", &cost[i][j]);\n    \n\n    assignTasks(0, 0);\n\n    printf(\"Minimum Assignment Cost: %d\\n\", minCost);\n    return 0;\n}", "python": "", "java": "", "javascript": "", "typescript": "", "go": "", "rust": "", "c#": ""}'::jsonb,
        true
    );
    
    RAISE NOTICE 'Successfully migrated Assignment Problem as sample. Use this pattern for other programs.';
END;
$$;

-- Clean up temporary objects
DROP TABLE IF EXISTS category_mapping;
