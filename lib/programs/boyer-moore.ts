import type { Program } from "../types"

export const boyerMooreProgram: Program = {
  id: "boyer-moore",
  name: "Boyer-Moore Algorithm",
  description:
    "An efficient string searching algorithm that uses information gathered during a pre-processing step to skip sections of the text, resulting in a lower number of comparisons. It uses two heuristics: the bad-character rule and the good-suffix rule.",
  category: "Space and Time Tradeoffs",
  examples: [
    {
      input: "Text: ABABDABACDABABCABAB\nPattern: ABABCABAB",
      output: "Pattern found at index 10.",
      explanation: "Boyer-Moore efficiently finds the pattern.",
    },
    {
      input: "Text: AAAAAAAA\nPattern: BBA",
      output: "Pattern NOT found.",
      explanation: "The pattern does not exist in the text.",
    },
    {
      input: "Text: GCAATGCCTATGTGACC\nPattern: TATGTG",
      output: "Pattern found at index 9.",
      explanation: "Successfully finds TATGTG.",
    },
  ],
  algorithmSteps: [
    "Preprocessing Phase:",
    "  1. Bad-Character Heuristic: Create a table (badChar) storing the last occurrence of each character in the pattern. If a character is not in the pattern, its entry can be -1 or m (pattern length). Shift = `j - badChar[text[s+j]]`, where `j` is mismatch index in pattern, `s` is current shift.",
    "  2. Good-Suffix Heuristic: Create tables (borderPos, suffix) to handle cases where a suffix of the pattern matches a segment of the text, but a mismatch occurs before the full pattern matches. This rule determines the shift based on previously matched suffixes.",
    "    a. `suffix[i]` stores the length of the longest suffix of `pattern[0...i-1]` that is also a suffix of the entire pattern.",
    "    b. `borderPos[i]` stores the starting position of such a border for `pattern[0...i-1]`.",
    "Searching Phase:",
    "  1. Align the pattern with the beginning of the text (shift `s = 0`).",
    "  2. Compare the pattern with the text from right to left (index `j` from `m-1` down to `0`).",
    "  3. If a mismatch occurs at `pattern[j]` and `text[s+j]`:",
    "     Calculate shift from bad-character rule: `shift_bc = max(1, j - badChar[text[s+j]])`.",
    "     Calculate shift from good-suffix rule: `shift_gs = suffix[j+1]` (if `j < m-1`, else a different value based on full suffix match).",
    "     Apply the maximum of these two shifts: `s += max(shift_bc, shift_gs)`.",
    "  4. If all characters match (`j` becomes -1), the pattern is found at index `s`. To find further occurrences, shift by `suffix[0]` (length of the longest suffix of pattern that is also a prefix).",
    "  5. Repeat until `s` exceeds `n-m`.",
  ],
  keyProperties: [
    "Combines two heuristics: bad-character and good-suffix.",
    "Right-to-left pattern scanning.",
    "Preprocessing complexity: O(m + alphabet_size).",
    "Worst-case search time: O(mn) in naive versions, but can be O(n) with specific good-suffix implementations (e.g., Galil's rule). Often performs in O(n/m) on average.",
    "Space complexity: O(m + alphabet_size) for the tables.",
  ],
  timeComplexity: {
    best: "O(n/m) (average/best for random text)",
    average: "O(n) in many practical cases, can be O(n/m)",
    worst: "O(mn) (can be improved to O(n) with more complex good-suffix rule variants)",
    space: "O(m + alphabet_size) for shift tables",
    analysis: `
# Time Complexity Analysis for Boyer-Moore Algorithm

## Algorithm Overview

The Boyer-Moore algorithm is renowned for its efficiency in string searching. It achieves this by employing two main heuristics to determine how far to shift the pattern along the text after a mismatch or a full match:
1.  **Bad-Character Heuristic:** When a mismatch occurs at \\\`text[s+j]\\\` (where \\\`pattern[j]\\\` is the mismatched character), this rule suggests shifting the pattern so that \\\`text[s+j]\\\` aligns with the last occurrence of that character in \\\`pattern[0...j-1]\\\`. If \\\`text[s+j]\\\` is not in \\\`pattern[0...j-1]\\\`, the pattern can be shifted past \\\`text[s+j]\\\` entirely.
2.  **Good-Suffix Heuristic:** If a mismatch occurs after some suffix of the pattern has matched the text (say, \\\`pattern[j+1...m-1]\\\` matched \\\`text[s+j+1...s+m-1]\\\`), this rule helps to shift the pattern to align the next occurrence of this matched suffix in the pattern with the text. If the matched suffix does not recur, other sub-rules apply (e.g., aligning the longest suffix of the pattern that is also a prefix).

## Phases

1.  **Preprocessing Phase:**
    *   **Bad-Character Table (\\\`badchar\\\`):** For each character in the alphabet, store the index of its rightmost occurrence in the pattern. If a character does not appear, its value is typically -1. This takes **O(m + k)** time, where \\\`m\\\` is pattern length and \\\`k\\\` is alphabet size.
    *   **Good-Suffix Tables (\\\`suffix\\\`, \\\`borderPos\\\`):** This is more complex. It involves finding, for each \\\`i\\\`, the length of the longest suffix of \\\`pattern[0...i-1]\\\` that is also a suffix of the entire pattern. This preprocessing can be done in **O(m)** time.

2.  **Searching Phase:**
    *   The pattern is compared from right to left.
    *   After a mismatch or a full match, the algorithm calculates the shift suggested by both heuristics and takes the maximum of these shifts.

## Complexity Summary

| Phase         | Time Complexity        | Space Complexity |
|---------------|------------------------|------------------|
| Preprocessing | O(m + k)               | O(m + k)         |
| Searching     | Best: O(n/m), Worst: O(mn) (or O(n) with advanced rules) | O(1)             |
| **Overall**   | **Worst: O(mn + k)** (can be O(n+k)) | **O(m + k)**     |

*(n = text length, m = pattern length, k = alphabet size)*

## Detailed Analysis

### Time Complexity

-   **Preprocessing:** O(m + k) as described.
-   **Searching Phase:**
    -   **Worst Case: O(mn)**. This can happen with naive implementations, for example, searching for \\\`\"a^m-1 b\"\\\` in \\\`\"a^n\"\\\`. However, with a correctly implemented good-suffix rule (especially variants like Galil's rule), the worst-case search time can be linear, **O(n)**.
    -   **Best Case / Average Case: O(n/m)**. For typical inputs, Boyer-Moore is extremely fast, often performing fewer than \\\`n\\\` comparisons. The average number of comparisons per character can be very low, especially for large alphabets.

-   **Overall Worst Case:** With standard implementations, it's often cited as O(mn + k), but with optimized good-suffix rules, it can achieve **O(n + k)**.

### Space Complexity

-   **Bad-Character Table:** O(k)
-   **Good-Suffix Tables:** O(m)
-   Total auxiliary space: **O(m + k)**.

## Comparison with Horspool

-   Boyer-Moore is generally more efficient than Horspool's algorithm because the good-suffix rule can lead to larger shifts, especially when the bad-character rule gives a small shift.
-   However, Boyer-Moore's preprocessing, particularly for the good-suffix rule, is more complex to implement correctly than Horspool's simpler shift table.
    `,
  },
  code: "#include <stdio.h>\n#include <string.h>\n#include <limits.h>\n\n#define ALPHABET_SIZE 256\n\nint max(int a, int b) { return (a > b) ? a : b; }\n\nvoid badCharHeuristic(const char *str, int size, int badchar[ALPHABET_SIZE]) {\n    int i;\n    for (i = 0; i < ALPHABET_SIZE; i++)\n        badchar[i] = -1;\n    for (i = 0; i < size; i++)\n        badchar[(unsigned char)str[i]] = i;\n}\n\nvoid goodSuffixHeuristic(const char *pat, int m, int borderPos[], int shift[]) {\n    int i = m, j = m + 1;\n    borderPos[i] = j;\n\n    while (i > 0) {\n        while (j <= m && pat[i - 1] != pat[j - 1]) {\n            if (shift[j] == 0)\n                shift[j] = j - i;\n            j = borderPos[j];\n        }\n        i--; j--;\n        borderPos[i] = j;\n    }\n\n    j = borderPos[0];\n    for (i = 0; i <= m; i++) {\n        if (shift[i] == 0)\n            shift[i] = j;\n        if (i == j)\n            j = borderPos[j];\n    }\n}\n\nint boyerMoore(const char *text, const char *pattern) {\n    int m = strlen(pattern);\n    int n = strlen(text);\n    if (m == 0 || m > n) return -1;\n\n    int badchar[ALPHABET_SIZE];\n    int borderPos[m + 1];\n    int goodSuffixShift[m + 1];\n\n    for(int k=0; k <= m; ++k) {\n        goodSuffixShift[k] = 0;\n    }\n\n    badCharHeuristic(pattern, m, badchar);\n    goodSuffixHeuristic(pattern, m, borderPos, goodSuffixShift);\n\n    int s = 0; \n    while (s <= (n - m)) {\n        int j = m - 1;\n        while (j >= 0 && pattern[j] == text[s + j])\n            j--;\n\n        if (j < 0) {\n            return s; \n        } else {\n            int bc_shift = max(1, j - badchar[(unsigned char)text[s + j]]);\n            int gs_shift = goodSuffixShift[j + 1];\n            s += max(bc_shift, gs_shift);\n        }\n    }\n    return -1;\n}\n\nint main(void) {\n    char text[200], pat[50];\n    printf(\"Text   : \"); fgets(text, sizeof(text), stdin);\n    printf(\"Pattern: \"); fgets(pat,  sizeof(pat),  stdin);\n\n    text[strcspn(text, \"\\n\")] = '\\0';\n    pat[strcspn(pat, \"\\n\")] = '\\0';\n\n    int pos = boyerMoore(text, pat);\n    if (pos == -1)\n        printf(\"Pattern NOT found.\\n\");\n    else\n        printf(\"Pattern found at index %d.\\n\", pos);\n    return 0;\n}"
}
