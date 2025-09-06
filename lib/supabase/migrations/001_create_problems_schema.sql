-- Migration: Create comprehensive problem and submission schema for LeetCode clone
-- Created: 2025-09-06

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Problem difficulty levels (like LeetCode)
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Submission status
CREATE TYPE submission_status AS ENUM ('pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compile_error');

-- Programming languages supported
CREATE TYPE programming_language AS ENUM ('c', 'cpp', 'java', 'python', 'javascript', 'typescript', 'go', 'rust', 'c#');

-- Categories/Topics for problems (can be extended)
CREATE TABLE problem_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories similar to LeetCode
INSERT INTO problem_categories (name, slug, description) VALUES
('Array', 'array', 'Problems involving arrays and list manipulations'),
('String', 'string', 'String manipulation and pattern matching problems'),
('Hash Table', 'hash-table', 'Problems using hash tables and dictionaries'),
('Dynamic Programming', 'dynamic-programming', 'Problems solvable using dynamic programming techniques'),
('Math', 'math', 'Mathematical and number theory problems'),
('Greedy', 'greedy', 'Problems solvable using greedy algorithms'),
('Sorting', 'sorting', 'Sorting algorithm problems'),
('Binary Search', 'binary-search', 'Binary search and divide-and-conquer problems'),
('Two Pointers', 'two-pointers', 'Two pointers technique problems'),
('Tree', 'tree', 'Binary tree and tree structure problems'),
('Graph', 'graph', 'Graph theory and traversal problems'),
('Backtracking', 'backtracking', 'Backtracking algorithm problems'),
('Stack', 'stack', 'Stack data structure problems'),
('Queue', 'queue', 'Queue and BFS problems'),
('Linked List', 'linked-list', 'Linked list manipulation problems'),
('Heap', 'heap', 'Heap and priority queue problems'),
('Trie', 'trie', 'Trie (prefix tree) problems'),
('Union Find', 'union-find', 'Disjoint set union problems'),
('Bit Manipulation', 'bit-manipulation', 'Bitwise operation problems'),
('Sliding Window', 'sliding-window', 'Sliding window technique problems');

-- Main problems table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    
    -- Problem constraints and hints
    constraints TEXT,
    hints TEXT[], -- Array of hint strings
    
    -- LeetCode-style metadata
    acceptance_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    total_submissions INTEGER DEFAULT 0,
    total_accepted INTEGER DEFAULT 0,
    
    -- Timing constraints
    time_limit_ms INTEGER DEFAULT 2000, -- 2 seconds default
    memory_limit_mb INTEGER DEFAULT 256, -- 256 MB default
    
    -- Status and visibility
    is_published BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Author (admin who created the problem)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Junction table for problem categories (many-to-many)
CREATE TABLE problem_category_relations (
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    category_id UUID REFERENCES problem_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, category_id)
);

-- Test cases for problems
CREATE TABLE problem_test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    
    -- Test case data
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    
    -- Test case metadata
    is_example BOOLEAN DEFAULT false, -- Whether to show in problem description
    is_hidden BOOLEAN DEFAULT true,   -- Hidden test cases for evaluation
    
    -- Ordering and grouping
    order_index INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Editorial/Solution content
CREATE TABLE problem_editorials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    
    -- Editorial content (markdown format)
    approach_title VARCHAR(255) NOT NULL,
    approach_description TEXT NOT NULL,
    intuition TEXT,
    algorithm_steps TEXT,
    complexity_analysis TEXT,
    
    -- Code solutions for different languages
    code_solutions JSONB, -- {"python": "def solution()...", "cpp": "#include..."}
    
    -- Metadata
    is_official BOOLEAN DEFAULT true, -- Official editorial vs community solution
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User submissions
CREATE TABLE user_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Submission details
    language programming_language NOT NULL,
    code TEXT NOT NULL,
    status submission_status NOT NULL DEFAULT 'pending',
    
    -- Execution results
    runtime_ms INTEGER,
    memory_usage_mb DECIMAL(10,2),
    
    -- Test case results
    passed_test_cases INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    failed_test_case_index INTEGER, -- Which test case failed (0-indexed)
    error_message TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    judged_at TIMESTAMPTZ,
    
    -- Additional metadata
    submission_count INTEGER DEFAULT 1 -- Track how many times user submitted for this problem
);

-- User problem progress tracking
CREATE TABLE user_problem_progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    
    -- Progress status
    is_solved BOOLEAN DEFAULT false,
    is_attempted BOOLEAN DEFAULT false,
    best_submission_id UUID REFERENCES user_submissions(id),
    
    -- Stats
    total_attempts INTEGER DEFAULT 0,
    first_solved_at TIMESTAMPTZ,
    last_attempted_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (user_id, problem_id)
);

-- Indexes for better performance
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_slug ON problems(slug);
CREATE INDEX idx_problems_published ON problems(is_published);
CREATE INDEX idx_test_cases_problem_id ON problem_test_cases(problem_id);
CREATE INDEX idx_test_cases_order ON problem_test_cases(problem_id, order_index);
CREATE INDEX idx_submissions_user_problem ON user_submissions(user_id, problem_id);
CREATE INDEX idx_submissions_status ON user_submissions(status);
CREATE INDEX idx_submissions_submitted_at ON user_submissions(submitted_at DESC);
CREATE INDEX idx_progress_user ON user_problem_progress(user_id);
CREATE INDEX idx_progress_solved ON user_problem_progress(is_solved);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_test_cases_updated_at
    BEFORE UPDATE ON problem_test_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_editorials_updated_at
    BEFORE UPDATE ON problem_editorials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to update problem statistics after submission
CREATE OR REPLACE FUNCTION update_problem_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update problem submission counts
    IF TG_OP = 'INSERT' THEN
        UPDATE problems 
        SET total_submissions = total_submissions + 1
        WHERE id = NEW.problem_id;
        
        -- If submission is accepted, increment accepted count
        IF NEW.status = 'accepted' THEN
            UPDATE problems 
            SET total_accepted = total_accepted + 1,
                acceptance_rate = ROUND((total_accepted + 1.0) / (total_submissions) * 100, 2)
            WHERE id = NEW.problem_id;
        END IF;
    END IF;
    
    -- Update status from pending to final status
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
        -- Update judged timestamp
        NEW.judged_at = NOW();
        
        -- If newly accepted, increment accepted count
        IF NEW.status = 'accepted' THEN
            UPDATE problems 
            SET total_accepted = total_accepted + 1
            WHERE id = NEW.problem_id;
            
            -- Update user progress
            INSERT INTO user_problem_progress (user_id, problem_id, is_solved, is_attempted, best_submission_id, first_solved_at, total_attempts)
            VALUES (NEW.user_id, NEW.problem_id, true, true, NEW.id, NOW(), 1)
            ON CONFLICT (user_id, problem_id) 
            DO UPDATE SET 
                is_solved = true,
                best_submission_id = NEW.id,
                first_solved_at = COALESCE(user_problem_progress.first_solved_at, NOW()),
                total_attempts = user_problem_progress.total_attempts + 1,
                last_attempted_at = NOW();
        ELSE
            -- Update user progress for non-accepted submission
            INSERT INTO user_problem_progress (user_id, problem_id, is_attempted, total_attempts, last_attempted_at)
            VALUES (NEW.user_id, NEW.problem_id, true, 1, NOW())
            ON CONFLICT (user_id, problem_id) 
            DO UPDATE SET 
                is_attempted = true,
                total_attempts = user_problem_progress.total_attempts + 1,
                last_attempted_at = NOW();
        END IF;
        
        -- Recalculate acceptance rate
        UPDATE problems 
        SET acceptance_rate = ROUND(
            CASE 
                WHEN total_submissions > 0 THEN (total_accepted::DECIMAL / total_submissions) * 100 
                ELSE 0 
            END, 2
        )
        WHERE id = NEW.problem_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_submission_stats
    BEFORE INSERT OR UPDATE ON user_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_problem_stats();
