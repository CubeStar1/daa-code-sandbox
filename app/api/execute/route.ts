import { type NextRequest, NextResponse } from "next/server"
import { JUDGE0_API_URL, RAPIDAPI_KEY, RAPIDAPI_HOST, C_LANGUAGE_ID, CPP_LANGUAGE_ID } from "@/lib/judge0";
import { executeOneCompiler, OneCompilerResponse, OneCompilerErrorResponse } from "../../../lib/onecompiler";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider') || 'onecompiler'; // Default to judge0
  try {
        const { code, input, language } = await request.json()

    const languageId = language === 'cpp' ? CPP_LANGUAGE_ID : C_LANGUAGE_ID;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    if (provider === 'onecompiler') {
            const oneCompilerResult = await executeOneCompiler(parseInt(languageId, 10), code, input || "");

      if (oneCompilerResult.status === 'error') {
        const errorDetails = oneCompilerResult as OneCompilerErrorResponse;
        console.error("OneCompiler execution error:", errorDetails.message);
        return NextResponse.json(
          { error: `OneCompiler execution failed: ${errorDetails.message}` },
          { status: 500 },
        );
      }

      const successResult = oneCompilerResult as OneCompilerResponse;

      if (successResult.status !== 'success') {
        console.error("OneCompiler API returned non-success status:", successResult);
        return NextResponse.json(
          {
            output: `Error: ${successResult.exception || successResult.stderr || 'Unknown OneCompiler error'}`,
            time: successResult.executionTime ? (successResult.executionTime / 1000).toFixed(2) + "s" : null,
            memory: null,
          },
          { status: 200 },
        );
      }
      
      let output = successResult.stdout || "Program executed successfully (no output)";
      if (successResult.stderr) {
        output = `Runtime Error:\n${successResult.stderr}`;
      } else if (successResult.exception) {
        output = `Execution Error or Compilation Error:\n${successResult.exception}`;
      }

      return NextResponse.json({
        output,
        time: successResult.executionTime ? (successResult.executionTime / 1000).toFixed(2) : null,
        memory: null,
      });

    } else {
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
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error("Judge0 submission error:", errorText);
        return NextResponse.json(
          {
            error: `Judge0 submission failed: ${submitResponse.status} ${submitResponse.statusText}`,
          },
          { status: 500 },
        );
      }

      const result = await submitResponse.json();

      if (result.status?.id > 3) { // Judge0 status IDs: 1-In Queue, 2-Processing, 3-Accepted. Others are errors.
        let errorMessage = result.status?.description || "Unknown error";
        if (result.compile_output) errorMessage = `Compilation Error:\n${result.compile_output}`;
        else if (result.stderr) errorMessage = `Runtime Error:\n${result.stderr}`;
        
        return NextResponse.json({
          output: errorMessage,
          time: result.time,
          memory: result.memory,
        });
      }
      
      return NextResponse.json({
        output: result.stdout || "Program executed successfully (no output)",
        time: result.time,
        memory: result.memory,
      });
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
