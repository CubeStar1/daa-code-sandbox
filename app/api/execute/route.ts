import { type NextRequest, NextResponse } from "next/server"
import { JUDGE0_API_URL, RAPIDAPI_KEY, RAPIDAPI_HOST } from "@/lib/judge0"
import { executeOneCompiler, OneCompilerResponse, OneCompilerErrorResponse } from "@/lib/onecompiler"
import type { ProgrammingLanguage } from "@/lib/database-types"

// Language mapping for Judge0
const getJudge0LanguageId = (language: ProgrammingLanguage): number => {
  const languageMap: Record<ProgrammingLanguage, number> = {
    'c': 50,           // C (GCC 9.2.0)
    'cpp': 54,         // C++ (GCC 9.2.0)
    'java': 62,        // Java (OpenJDK 13.0.1)
    'python': 71,      // Python (3.8.1)
    'javascript': 63,  // JavaScript (Node.js 12.14.0)
    'typescript': 74,  // TypeScript (3.7.4)
    'go': 60,          // Go (1.13.5)
    'rust': 73,        // Rust (1.40.0)
    'c#': 51           // C# (Mono 6.6.0.161)
  }
  return languageMap[language] || 71 // Default to Python
}

// Language mapping for OneCompiler
const getOneCompilerLanguage = (language: ProgrammingLanguage): string => {
  const languageMap: Record<ProgrammingLanguage, string> = {
    'c': 'c',
    'cpp': 'cpp',
    'java': 'java',
    'python': 'python',
    'javascript': 'nodejs',
    'typescript': 'typescript',
    'go': 'go',
    'rust': 'rust',
    'c#': 'csharp'
  }
  return languageMap[language] || 'python'
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const provider = searchParams.get('provider') || 'onecompiler'
  
  try {
    const { code, input, language } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const typedLanguage = language as ProgrammingLanguage

    if (provider === 'onecompiler') {
      // Convert language to Judge0 ID for OneCompiler compatibility
      const languageId = getJudge0LanguageId(typedLanguage)
      const oneCompilerResult = await executeOneCompiler(languageId, code, input || "")

      if (oneCompilerResult.status === 'error') {
        const errorDetails = oneCompilerResult as OneCompilerErrorResponse
        console.error("OneCompiler execution error:", errorDetails.message)
        return NextResponse.json(
          { error: `OneCompiler execution failed: ${errorDetails.message}` },
          { status: 500 },
        )
      }

      const successResult = oneCompilerResult as OneCompilerResponse

      if (successResult.status !== 'success') {
        console.error("OneCompiler API returned non-success status:", successResult)
        return NextResponse.json(
          {
            output: `Error: ${successResult.exception || successResult.stderr || 'Unknown OneCompiler error'}`,
            time: successResult.executionTime ? (successResult.executionTime / 1000).toFixed(2) + "s" : null,
            memory: null,
          },
          { status: 200 },
        )
      }
      
      let output = successResult.stdout || "Program executed successfully (no output)"
      if (successResult.stderr) {
        output = `Runtime Error:\n${successResult.stderr}`
      } else if (successResult.exception) {
        output = `Execution Error or Compilation Error:\n${successResult.exception}`
      }

      return NextResponse.json({
        output,
        time: successResult.executionTime ? (successResult.executionTime / 1000).toFixed(2) : null,
        memory: null,
      })

    } else {
      // Judge0 execution
      const languageId = getJudge0LanguageId(typedLanguage)
      
      const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: code,
          stdin: input || "",
        }),
      })

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text()
        console.error("Judge0 submission error:", errorText)
        return NextResponse.json(
          {
            error: `Judge0 submission failed: ${submitResponse.status} ${submitResponse.statusText}`,
          },
          { status: 500 },
        )
      }

      const result = await submitResponse.json()

      if (result.status?.id > 3) { // Judge0 status IDs: 1-In Queue, 2-Processing, 3-Accepted. Others are errors.
        let errorMessage = result.status?.description || "Unknown error"
        if (result.compile_output) errorMessage = `Compilation Error:\n${result.compile_output}`
        else if (result.stderr) errorMessage = `Runtime Error:\n${result.stderr}`
        
        return NextResponse.json({
          output: errorMessage,
          time: result.time,
          memory: result.memory,
        })
      }
      
      return NextResponse.json({
        output: result.stdout || "Program executed successfully (no output)",
        time: result.time,
        memory: result.memory,
      })
    }
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
