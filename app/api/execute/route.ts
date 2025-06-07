import { type NextRequest, NextResponse } from "next/server"
import { JUDGE0_API_URL, RAPIDAPI_KEY, RAPIDAPI_HOST, C_LANGUAGE_ID } from "@/lib/judge0"

export async function POST(request: NextRequest) {
  try {
    const { code, input } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    // Submit code for execution
    const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
      body: JSON.stringify({
        language_id: C_LANGUAGE_ID,
        source_code: code,
        stdin: input || "",
      }),
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.error("Judge0 submission error:", errorText)
      return NextResponse.json(
        {
          error: `Submission failed: ${submitResponse.status} ${submitResponse.statusText}`,
        },
        { status: 500 },
      )
    }

    const result = await submitResponse.json()

    // Check if there was a compilation error
    if (result.compile_output) {
      return NextResponse.json({
        output: `Compilation Error:\n${result.compile_output}`,
        time: result.time,
        memory: result.memory,
      })
    }

    // Check if there was a runtime error
    if (result.stderr) {
      return NextResponse.json({
        output: `Runtime Error:\n${result.stderr}`,
        time: result.time,
        memory: result.memory,
      })
    }

    // Return successful output
    return NextResponse.json({
      output: result.stdout || "Program executed successfully (no output)",
      time: result.time,
      memory: result.memory,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
