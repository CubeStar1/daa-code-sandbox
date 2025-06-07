import type { Program } from "../types"

export const horspoolProgram: Program = {
  id: "horspool",
  name: "Horspool's Algorithm",
  description:
    "An efficient string searching algorithm that uses a shift table based on the last character of the current window in the text. It's a simplification of the Boyer-Moore algorithm.",
  category: "Space and Time Tradeoffs",
  examples: [
    {
      input: "Text: AABAACAADAABAABA\nPattern: AABA",
      output: "Pattern found at index 0.",
      explanation: "The first occurrence of 'AABA' is at the beginning.",
    },
    {
      input: "Text: THIS IS A TEST TEXT\nPattern: TEST",
      output: "Pattern found at index 10.",
      explanation: "'TEST' is found starting at index 10.",
    },
    {
      input: "Text: ABCDEFG\nPattern: XYZ",
      output: "Pattern NOT found.",
      explanation: "'XYZ' does not appear in 'ABCDEFG'.",
    },
  ],
  algorithmSteps: [
    "Preprocessing: Construct the shift table. For each character in the alphabet, store the shift amount. The shift for a character 'c' is typically the length of the pattern 'm', unless 'c' appears in the first m-1 characters of the pattern. If 'c' is pat[j] (where j < m-1), its shift is m-1-j.",
    "Searching: Align the pattern with the beginning of the text.",
    "Compare the pattern with the text from right to left.",
    "If a mismatch occurs at text[i] (which aligns with pat[k]), or if the entire pattern matches:",
    "  Shift the pattern to the right by the value in the shift table corresponding to text[i] (the character in the text aligned with the rightmost character of the pattern).",
    "Repeat until the pattern is found or the end of the text is passed.",
  ],
  keyProperties: [
    "Uses a shift table to determine how far to slide the pattern upon a mismatch or a full match.",
    "The shift is based on the character in the text aligned with the rightmost character of the pattern.",
    "Generally faster than naive string search, especially for larger alphabets and longer patterns.",
    "Preprocessing phase takes O(m + alphabet_size) time.",
    "Worst-case search time is O(mn), but average-case is often sublinear (e.g., O(n/m) or O(n)).",
  ],
  timeComplexity: {
    best: "O(n/m) (average/best for random text)",
    average: "O(n) in many practical cases, can be O(n/m)",
    worst: "O(mn)",
    space: "O(alphabet_size) for the shift table",
    analysis: `
# Time Complexity Analysis for Horspool's Algorithm

## Algorithm Overview

Horspool's algorithm is a string searching algorithm that improves upon naive search by using a shift table. The key idea is to determine the maximum possible shift based on the character in the text that aligns with the *last character of the pattern* when a mismatch occurs or after a match.

## Phases

1.  **Preprocessing (Shift Table Construction):**
    *   Create a table (typically an array indexed by character codes) to store shift values.
    *   Initialize all shifts to \\\`m\\\` (length of the pattern).
    *   For each of the first \\\`m-1\\\` characters \\\`pat[j]\\\` of the pattern, set \\\`shift[pat[j]] = m - 1 - j\\\`.
    *   This phase takes **O(m + k)** time, where \\\`m\\\` is the pattern length and \\\`k\\\` is the size of the alphabet.

2.  **Searching Phase:**
    *   Align the pattern with the text.
    *   Compare characters from right to left.
    *   If a mismatch occurs, or after a full match, consult the shift table using the character in the text \\\`text[i]\\\` that was aligned with the last character of the pattern (\\\`pat[m-1]\\\`). Shift the pattern by \\\`shift[text[i]]\\\`.

## Complexity Summary

| Phase         | Time Complexity        | Space Complexity |
|---------------|------------------------|------------------|
| Preprocessing | O(m + k)               | O(k)             |
| Searching     | Best: O(n/m), Worst: O(mn) | O(1)             |
| **Overall**   | **Worst: O(mn + k)**   | **O(k)**         |

*(n = text length, m = pattern length, k = alphabet size)*

## Detailed Analysis

### Time Complexity

-   **Preprocessing:** As stated, **O(m + k)**.

-   **Searching Phase:**
    -   **Worst Case: O(mn)**
        This occurs in scenarios like searching for \\\`\"aaa\"\\\` in \\\`\"aaaa...a\"\\\` or \\\`\"baa...a\"\\\` in \\\`\"aaaa...a\"\\\`. In each attempt, only one character might be compared before a shift of 1 occurs.
    -   **Best Case / Average Case: O(n/m) to O(n)**
        For random texts and patterns, or when the alphabet is large, the shifts are often large, leading to fewer comparisons. The algorithm can skip large portions of the text. For example, if the character \\\`text[i]\\\` (aligned with \\\`pat[m-1]\\\`) does not appear in the pattern at all, the shift will be \\\`m\\\`, moving the pattern completely past the current alignment.
        On average, for a random text, the number of comparisons can be close to \\\`c*n/m\\\` for some small constant \\\`c\\\`, making it very efficient.

-   **Overall Worst Case:** Combining preprocessing and searching, it's **O(mn + k)**.

### Space Complexity

-   The primary space requirement is for the **shift table**, which is **O(k)**, where \\\`k\\\` is the size of the alphabet (e.g., 256 for ASCII characters).

## Comparison

-   **Naive Algorithm:** O(mn) worst-case and average-case time, O(1) space.
-   **Boyer-Moore Algorithm:** O(n+m+k) best/average case, O(mn) worst case (though variants achieve O(n) worst case). More complex preprocessing with two shift rules (bad character and good suffix).
-   **Knuth-Morris-Pratt (KMP):** O(n+m) worst-case time, O(m) space for its prefix table.

Horspool's is simpler to implement than Boyer-Moore and KMP, and often performs very well in practice, making it a good trade-off between implementation complexity and performance.
    `,
  },
  code: "#include <stdio.h>\n#include <string.h>\n#include <limits.h>\n\n#define ALPHABET 256\n\nvoid buildShift(const char *pat, int m, int shift[])\n{\n    for (int c = 0; c < ALPHABET; ++c)\n        shift[c] = m;\n\n    for (int i = 0; i < m - 1; ++i)\n        shift[(unsigned char)pat[i]] = m - 1 - i;\n}\n\nint horspool(const char *text, const char *pat)\n{\n    int n = strlen(text);\n    int m = strlen(pat);\n    if (m == 0 || m > n) return -1;\n\n    int shift[ALPHABET];\n    buildShift(pat, m, shift);\n\n    int i = m - 1;\n    while (i < n) {\n        int k = 0;\n        while (k < m && pat[m - 1 - k] == text[i - k])\n            ++k;\n\n        if (k == m)\n            return i - m + 1;\n\n        i += shift[(unsigned char)text[i]];\n    }\n    return -1;\n}\n\nint main(void)\n{\n    char text[200], pat[50];\n    printf(\"Text   : \"); fgets(text, sizeof(text), stdin);\n    printf(\"Pattern: \"); fgets(pat,  sizeof(pat),  stdin);\n\n    text[strcspn(text, \"\\n\")] = pat[strcspn(pat, \"\\n\")] = '\\0';\n\n    int pos = horspool(text, pat);\n    if (pos == -1)\n        puts(\"Pattern NOT found.\");\n    else\n        printf(\"Pattern found at index %d.\\n\", pos);\n\n    return 0;\n}"
}
