import type { ExecutionResult } from "./types"

const JUDGE0_API_URL = process.env.JUDGE0_API_URL!
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST!
const C_LANGUAGE_ID = process.env.C_LANGUAGE_ID!

export async function executeCode(code: string, input = "", provider?: 'judge0' | 'onecompiler'): Promise<ExecutionResult> {
  try {
    const apiUrl = provider ? `/api/execute?provider=${provider}` : "/api/execute";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, input }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        // The /api/execute route itself returned a 429 (e.g., from Vercel firewall)
        console.warn("Rate limit hit when calling /api/execute");
        return {
          output: "",
          error: "You've made too many requests in a short period. Please wait a moment and try again.",
          isRateLimited: true,
        };
      }
      // For other HTTP errors when calling /api/execute
      const errorText = await response.text(); 
      throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
    }

    // If response is OK (e.g. 200), parse it.
    // The parsed body should already be in ExecutionResult format, 
    // potentially with an 'error' field if code execution failed, or 'isRateLimited' if the downstream API (OneCompiler/Judge0) was rate-limited.
    return await response.json();
  } catch (error) {
    return {
      output: `Network Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export { JUDGE0_API_URL, RAPIDAPI_KEY, RAPIDAPI_HOST, C_LANGUAGE_ID }
