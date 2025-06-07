import { findMaximumProgram } from "./programs/find-maximum"
import { mergeSortProgram } from "./programs/merge-sort"
import { binarySearchProgram } from "./programs/binary-search"
import type { Program } from "./types"
import { towerOfHanoiProgram } from "./programs/tower-of-hanoi"
import { quickSortProgram } from "./programs/quick-sort"
import { topologicalSortProgram } from "./programs/topological-sort"
import { bfsProgram } from "./programs/bfs"
import { elementUniquenessPresortProgram } from "./programs/element-uniqueness-presort"
import { heapSortProgram } from "./programs/heap-sort"
import { horspoolProgram } from "./programs/horspool"
import { boyerMooreProgram } from "./programs/boyer-moore"
import { warshallProgram } from "./programs/warshall"
import { floydWarshallProgram } from "./programs/floyd"
import { knapsackMemoizedProgram } from "./programs/knapsack-memoized"
import { dijkstraProgram } from "./programs/dijkstra"
import { primProgram } from "./programs/prim"
import { nQueensProgram } from "./programs/nqueens"
import { subsetSumProgram } from "./programs/subset-sum"
import { tspProgram } from "./programs/tsp"
import { assignmentProblemProgram } from "./programs/assignment-problem"

export const programs: Program[] = [findMaximumProgram, 
    towerOfHanoiProgram, 
    mergeSortProgram, 
    quickSortProgram, 
    topologicalSortProgram, 
    bfsProgram, 
    elementUniquenessPresortProgram, 
    heapSortProgram, 
    horspoolProgram, 
    boyerMooreProgram, 
    warshallProgram, 
    floydWarshallProgram, 
    knapsackMemoizedProgram, 
    dijkstraProgram, 
    primProgram, 
    nQueensProgram,
    subsetSumProgram,
    tspProgram,
    assignmentProblemProgram
]
