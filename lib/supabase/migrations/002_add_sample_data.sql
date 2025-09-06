-- Migration: Add sample problems and helper functions
-- Created: 2025-09-06

-- Helper function to get problems with category information
CREATE OR REPLACE FUNCTION get_problems_with_categories()
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    description TEXT,
    difficulty difficulty_level,
    acceptance_rate DECIMAL,
    total_submissions INTEGER,
    total_accepted INTEGER,
    categories TEXT[]
) 
LANGUAGE sql
AS $$
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.description,
        p.difficulty,
        p.acceptance_rate,
        p.total_submissions,
        p.total_accepted,
        ARRAY_AGG(pc.name) AS categories
    FROM problems p
    LEFT JOIN problem_category_relations pcr ON p.id = pcr.problem_id
    LEFT JOIN problem_categories pc ON pcr.category_id = pc.id
    WHERE p.is_published = true
    GROUP BY p.id, p.title, p.slug, p.description, p.difficulty, p.acceptance_rate, p.total_submissions, p.total_accepted
    ORDER BY p.created_at DESC;
$$;

-- Helper function to get user's submission stats for a problem
CREATE OR REPLACE FUNCTION get_user_problem_stats(user_uuid UUID, problem_uuid UUID)
RETURNS TABLE (
    total_attempts INTEGER,
    is_solved BOOLEAN,
    best_runtime_ms INTEGER,
    best_memory_mb DECIMAL,
    last_submission_status submission_status
)
LANGUAGE sql
AS $$
    SELECT 
        COALESCE(upp.total_attempts, 0) as total_attempts,
        COALESCE(upp.is_solved, false) as is_solved,
        bs.runtime_ms as best_runtime_ms,
        bs.memory_usage_mb as best_memory_mb,
        ls.status as last_submission_status
    FROM user_problem_progress upp
    LEFT JOIN user_submissions bs ON upp.best_submission_id = bs.id
    LEFT JOIN LATERAL (
        SELECT status 
        FROM user_submissions 
        WHERE user_id = user_uuid AND problem_id = problem_uuid 
        ORDER BY submitted_at DESC 
        LIMIT 1
    ) ls ON true
    WHERE upp.user_id = user_uuid AND upp.problem_id = problem_uuid;
$$;

-- Insert sample problems (LeetCode-style)
DO $$
DECLARE
    array_cat_id UUID;
    string_cat_id UUID;
    hash_cat_id UUID;
    two_ptr_cat_id UUID;
    math_cat_id UUID;
    dp_cat_id UUID;
    
    problem1_id UUID;
    problem2_id UUID;
    problem3_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO array_cat_id FROM problem_categories WHERE slug = 'array';
    SELECT id INTO string_cat_id FROM problem_categories WHERE slug = 'string';
    SELECT id INTO hash_cat_id FROM problem_categories WHERE slug = 'hash-table';
    SELECT id INTO two_ptr_cat_id FROM problem_categories WHERE slug = 'two-pointers';
    SELECT id INTO math_cat_id FROM problem_categories WHERE slug = 'math';
    SELECT id INTO dp_cat_id FROM problem_categories WHERE slug = 'dynamic-programming';

    -- Problem 1: Two Sum (Easy)
    INSERT INTO problems (id, title, slug, description, difficulty, is_published, constraints, hints)
    VALUES (
        uuid_generate_v4(),
        'Two Sum',
        'two-sum',
        'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

**Example 2:**
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

**Example 3:**
```
Input: nums = [3,3], target = 6
Output: [0,1]
```',
        'easy',
        true,
        '- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.',
        ARRAY[
            'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it''s best to try out brute force solutions for just for completeness. It''s also important to discuss why this approach is not optimal.',
            'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?',
            'The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?'
        ]
    )
    RETURNING id INTO problem1_id;

    -- Add categories for Two Sum
    INSERT INTO problem_category_relations (problem_id, category_id) VALUES
    (problem1_id, array_cat_id),
    (problem1_id, hash_cat_id);

    -- Add test cases for Two Sum
    INSERT INTO problem_test_cases (problem_id, input, expected_output, is_example, order_index) VALUES
    (problem1_id, '[2,7,11,15]\n9', '[0,1]', true, 1),
    (problem1_id, '[3,2,4]\n6', '[1,2]', true, 2),
    (problem1_id, '[3,3]\n6', '[0,1]', true, 3),
    (problem1_id, '[1,2,3,4,5]\n9', '[3,4]', false, 4),
    (problem1_id, '[-1,-2,-3,-4,-5]\n-8', '[2,4]', false, 5);

    -- Add editorial for Two Sum
    INSERT INTO problem_editorials (problem_id, approach_title, approach_description, intuition, algorithm_steps, complexity_analysis, code_solutions) VALUES
    (problem1_id, 
     'Hash Map Approach', 
     'Use a hash map to store numbers we''ve seen and their indices, allowing us to find the complement in O(1) time.',
     'The brute force approach would be to check every pair of numbers, but that''s O(n²). Instead, we can use a hash map to remember numbers we''ve seen before. For each number, we check if its complement (target - current number) exists in our hash map.',
     '1. Create an empty hash map
2. Iterate through the array with index and value
3. Calculate complement = target - current value
4. If complement exists in hash map, return [hash_map[complement], current_index]
5. Otherwise, store current value and index in hash map
6. Continue until solution found',
     '**Time Complexity:** O(n) - We traverse the array once, and hash map operations are O(1) on average.

**Space Complexity:** O(n) - In the worst case, we store all n elements in the hash map.',
     '{"python": "def twoSum(nums, target):\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i\n    return []", "cpp": "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> hash_map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (hash_map.find(complement) != hash_map.end()) {\n                return {hash_map[complement], i};\n            }\n            hash_map[nums[i]] = i;\n        }\n        return {};\n    }\n};"}'::jsonb
    );

    -- Problem 2: Reverse String (Easy)
    INSERT INTO problems (id, title, slug, description, difficulty, is_published, constraints, hints)
    VALUES (
        uuid_generate_v4(),
        'Reverse String',
        'reverse-string',
        'Write a function that reverses a string. The input string is given as an array of characters `s`.

You must do this by modifying the input array **in-place** with O(1) extra memory.

**Example 1:**
```
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
```

**Example 2:**
```
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]
```',
        'easy',
        true,
        '- 1 <= s.length <= 10^5
- s[i] is a printable ascii character.',
        ARRAY[
            'The entire logic for reversing a string is based on using the opposite directional two-pointer approach!'
        ]
    )
    RETURNING id INTO problem2_id;

    -- Add categories for Reverse String
    INSERT INTO problem_category_relations (problem_id, category_id) VALUES
    (problem2_id, string_cat_id),
    (problem2_id, two_ptr_cat_id);

    -- Add test cases for Reverse String
    INSERT INTO problem_test_cases (problem_id, input, expected_output, is_example, order_index) VALUES
    (problem2_id, '["h","e","l","l","o"]', '["o","l","l","e","h"]', true, 1),
    (problem2_id, '["H","a","n","n","a","h"]', '["h","a","n","n","a","H"]', true, 2),
    (problem2_id, '["a"]', '["a"]', false, 3),
    (problem2_id, '["a","b"]', '["b","a"]', false, 4);

    -- Problem 3: Fibonacci Number (Easy)
    INSERT INTO problems (id, title, slug, description, difficulty, is_published, constraints, hints)
    VALUES (
        uuid_generate_v4(),
        'Fibonacci Number',
        'fibonacci-number',
        'The **Fibonacci numbers**, commonly denoted F(n) form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is,

```
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.
```

Given `n`, calculate `F(n)`.

**Example 1:**
```
Input: n = 2
Output: 1
Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.
```

**Example 2:**
```
Input: n = 3
Output: 2
Explanation: F(3) = F(2) + F(1) = 1 + 1 = 2.
```

**Example 3:**
```
Input: n = 4
Output: 3
Explanation: F(4) = F(3) + F(2) = 2 + 1 = 3.
```',
        'easy',
        true,
        '- 0 <= n <= 30',
        ARRAY[
            'Start with base cases and work your way up.',
            'Think about how you can store previously computed values to avoid redundant calculations.'
        ]
    )
    RETURNING id INTO problem3_id;

    -- Add categories for Fibonacci
    INSERT INTO problem_category_relations (problem_id, category_id) VALUES
    (problem3_id, math_cat_id),
    (problem3_id, dp_cat_id);

    -- Add test cases for Fibonacci
    INSERT INTO problem_test_cases (problem_id, input, expected_output, is_example, order_index) VALUES
    (problem3_id, '2', '1', true, 1),
    (problem3_id, '3', '2', true, 2),
    (problem3_id, '4', '3', true, 3),
    (problem3_id, '0', '0', false, 4),
    (problem3_id, '1', '1', false, 5),
    (problem3_id, '10', '55', false, 6);

END $$;
