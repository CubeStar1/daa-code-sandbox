import type { Program } from "../types";

export const nQueensProgram: Program = {
  id: "nqueens",
  name: "N-Queens Problem",
  description:
    "The N-Queens problem is the challenge of placing N non-attacking chess queens on an N×N chessboard. This means no two queens can share the same row, column, or diagonal.",
  category: "Backtracking",
  examples: [
    {
      input: "N = 4",
      output:
        "One possible solution for N=4:\n. Q . .\n. . . Q\nQ . . .\n. . Q .\n(Output format may vary based on implementation)",
      explanation:
        "The C code prints one valid configuration of 4 queens on a 4x4 board where no two queens threaten each other.",
    },
    {
      input: "N = 1",
      output: "Q",
      explanation: "A single queen on a 1x1 board."
    },
    {
      input: "N = 2 or N = 3",
      output: "No solution (N = 2 or 3).",
      explanation: "It's impossible to place 2 or 3 non-attacking queens on a 2x2 or 3x3 board respectively."
    }
  ],
  algorithmSteps: [
    "Start with the first row (row 0).",
    "For the current row, try placing a queen in each column (from 0 to N-1).",
    "  a. Before placing a queen in `(row, col)`, check if it's safe: no other queen in the same column, or on the same diagonals.",
    "  b. If safe: Place the queen, mark the column and diagonals as occupied.",
    "  c. Recursively call the function for the next row (`row + 1`).",
    "  d. If the recursive call returns true (meaning a solution is found for subsequent rows), return true.",
    "  e. If not, or if placing a queen in `(row, col)` doesn't lead to a solution, backtrack: remove the queen, unmark the column and diagonals.",
    "If all N queens are placed (i.e., `row == N`), a solution is found. Print the board and return true (or stop if only one solution is needed).",
    "If all columns in the current row have been tried and no solution is found, return false.",
  ],
  keyProperties: [
    "Uses backtracking to explore the solution space.",
    "Prunes branches of the search tree where a queen placement leads to an attack.",
    "The state includes the current row being considered and the positions of queens placed so far (or equivalently, which columns/diagonals are occupied).",
    "Can be modified to find all solutions or just one.",
  ],
  timeComplexity: {
    best: "O(N!) in naive backtracking, but significantly better with pruning.",
    average: "Exponential, generally much better than O(N*N!) due to pruning.",
    worst: "O(N!) - A loose upper bound. The number of solutions is related to A000170 in OEIS.",
    space: "O(N) for board representation and recursion stack (using 1D array for board and auxiliary arrays for columns/diagonals). O(N^2) if a 2D board is explicitly stored in each call.",
    analysis: `
# Time Complexity Analysis for N-Queens Problem

## Algorithm Overview
The N-Queens problem is typically solved using a backtracking algorithm. The algorithm explores possible placements of queens row by row (or column by column).

## Recursive Approach
1.  For each row, iterate through all columns.
2.  If a square (row, col) is safe to place a queen (not attacked by previously placed queens), place the queen.
3.  Recursively try to place queens in the next row.
4.  If the recursive call successfully places all subsequent queens, a solution is found.
5.  If not, backtrack: remove the queen from (row, col) and try the next column in the current row.

## Complexity Factors
-   In the worst-case, the algorithm might explore a significant portion of the N! permutations of placing N queens in N distinct columns (one per row).
-   However, the 'isSafe' check prunes many branches early. For example, once a queen is placed in column 'c' of row 'r', no other queen can be in column 'c'.
-   The number of nodes in the state-space tree is bounded by 1 + N + N(N-1) + N(N-1)(N-2) + ... + N!, which is roughly O(N!).
-   Each step (placing a queen and checking safety) can take O(N) or O(1) depending on the data structures used to track occupied columns and diagonals (the provided C code uses arrays for O(1) checks).

## Resulting Complexity
-   A loose upper bound for the time complexity is O(N!).
-   The actual number of operations is much less due to pruning. The number of solutions itself grows rapidly but is much smaller than N!.
-   It's difficult to give a precise, simple formula for the exact average or worst-case time complexity beyond it being exponential in N.

## Space Complexity
-   If the board is represented by a 1D array (e.g., board[row] = col), space is O(N).
-   Auxiliary arrays to track occupied columns and diagonals also take O(N) space.
-   The recursion stack depth can go up to N.
-   So, the space complexity is typically O(N).
    `,
  },
  code: {
    c: `
#include <stdio.h>
#include <math.h>

#define MAX 20

int board[MAX], count = 0;

int isSafe(int row, int col) {
    for (int i = 1; i < row; i++) {
        if (board[i] == col || abs(board[i] - col) == abs(i - row))
            return 0;
    }
    return 1;
}

void printSolution(int n) {
    count++;
    printf("\\nSolution %d:\\n", count);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (board[i] == j)
                printf(" Q ");
            else
                printf(" . ");
        }
        printf("\\n");
    }
}

void solve(int row, int n) {
    for (int col = 1; col <= n; col++) {
        if (isSafe(row, col)) {
            board[row] = col;
            if (row == n)
                printSolution(n);
            else
                solve(row + 1, n);
        }
    }
}

int main() {
    int n;
    printf("Enter the value of N (1–20): \\n");
    scanf("%d", &n);

    if (n < 1 || n > MAX) {
        printf("Invalid N value. Please enter between 1 and %d\\n", MAX);
        return 1;
    }

    solve(1, n);

    if (count == 0)
        printf("No solutions found.\\n");
    else
        printf("\\nTotal solutions: %d\\n", count);

    return 0;
}
  `,
    cpp: `
#include <bits/stdc++.h>
using namespace std;

bool solution_found = false;

void printBoard(int N, const vector<int>& board) {
    for (int r = 0; r < N; ++r) {
        for (int c = 0; c < N; ++c) {
            cout << (board[r] == c ? 'Q' : '.');
        }
        cout << endl;
    }
    cout << endl;
}

void solve(int r, int N, vector<int>& board, vector<bool>& cols, vector<bool>& diag1, vector<bool>& diag2) {
    if (solution_found) return;

    if (r == N) {
        printBoard(N, board);
        solution_found = true;
        return;
    }

    for (int c = 0; c < N; ++c) {
        if (cols[c] || diag1[r - c + N - 1] || diag2[r + c]) {
            continue;
        }

        board[r] = c;
        cols[c] = true;
        diag1[r - c + N - 1] = true;
        diag2[r + c] = true;

        solve(r + 1, N, board, cols, diag1, diag2);
        if (solution_found) return;

        cols[c] = false;
        diag1[r - c + N - 1] = false;
        diag2[r + c] = false;
    }
}

int main() {
    int N;
    cout << "Enter N: " << endl;
    cin >> N;

    if (N < 1) {
        cout << "Invalid N." << endl;
        return 1;
    }

    vector<int> board(N);
    vector<bool> cols(N, false);
    vector<bool> diag1(2 * N - 1, false);
    vector<bool> diag2(2 * N - 1, false);

    cout << "\nOne solution to the N-Queens problem:" << endl;
    solve(0, N, board, cols, diag1, diag2);

    if (!solution_found) {
        cout << "\nNo solution (N = 2 or 3)." << endl;
    }

    return 0;
}
`
  },
  sampleInput: "4",
};
