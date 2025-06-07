import type { ExecutionResult } from "./types"

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com"
const RAPIDAPI_KEY = "b4c7fd0ecdmsh98dacd9dab27f38p11724ajsn6ca2db484cc2"
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com"
const C_LANGUAGE_ID = 50

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
