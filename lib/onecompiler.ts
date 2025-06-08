// lib/onecompiler.ts

export interface OneCompilerResponse {
  status: string;
  exception: string | null;
  stdout: string | null;
  stderr: string | null;
  executionTime: number;
  stdin: string | null;
}

export interface OneCompilerErrorResponse {
  status: string;
  message: string;
}

interface FileEntry {
  name: string;
  content: string;
}

interface OneCompilerRequest {
  language: string;
  stdin?: string;
  files: FileEntry[];
}

// Mapping for C language (Judge0 ID 50 to OneCompiler 'c')
const C_LANGUAGE_ID_JUDGE0 = 50;
const ONECOMPILER_C_LANG = "c";

export async function executeOneCompiler(
  languageId: number,
  sourceCode: string,
  stdin?: string
): Promise<OneCompilerResponse | OneCompilerErrorResponse> {
  const apiKey = process.env.ONECOMPILER_API_KEY;
  if (!apiKey) {
    throw new Error("ONECOMPILER_API_KEY is not set in .env");
  }

  if (languageId !== C_LANGUAGE_ID_JUDGE0) {
    return {
      status: "error",
      message: `OneCompiler integration currently only supports C (Language ID ${C_LANGUAGE_ID_JUDGE0}). Received ${languageId}.`,
    };
  }
  const oneCompilerLanguage = ONECOMPILER_C_LANG;

  const fileName = "main.c";

  const requestBody: OneCompilerRequest = {
    language: oneCompilerLanguage,
    stdin: stdin || "",
    files: [{ name: fileName, content: sourceCode }],
  };

  try {
    const response = await fetch("https://onecompiler-apis.p.rapidapi.com/api/v1/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData: OneCompilerErrorResponse = await response.json();
      console.error("OneCompiler API error:", errorData);
      return {
        status: "error",
        message: errorData.message || `API request failed with status ${response.status}`,
      };
    }

    const result: OneCompilerResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling OneCompiler API:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
