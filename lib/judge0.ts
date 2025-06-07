import type { ExecutionResult } from "./types"

const JUDGE0_API_URL = process.env.JUDGE0_API_URL!
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST!
const C_LANGUAGE_ID = process.env.C_LANGUAGE_ID!

export async function executeCode(code: string, input = ""): Promise<ExecutionResult> {
  try {
    const response = await fetch("/api/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, input }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return {
      output: `Network Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export { JUDGE0_API_URL, RAPIDAPI_KEY, RAPIDAPI_HOST, C_LANGUAGE_ID }
