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

// Mapping for C and C++ languages from Judge0 IDs to OneCompiler strings
const C_LANGUAGE_ID_JUDGE0 = 50; // C (GCC 9.2.0)
const CPP_LANGUAGE_ID_JUDGE0 = 54; // C++ (GCC 9.2.0)
const ONECOMPILER_C_LANG = "c";
const ONECOMPILER_CPP_LANG = "cpp";

export async function executeOneCompiler(
  languageId: number,
  sourceCode: string,
  stdin?: string
): Promise<OneCompilerResponse | OneCompilerErrorResponse> {
  const apiKey = process.env.ONECOMPILER_API_KEY;
  if (!apiKey) {
    throw new Error("ONECOMPILER_API_KEY is not set in .env");
  }

  let oneCompilerLanguage: string;
  let fileName: string;

  if (languageId === C_LANGUAGE_ID_JUDGE0) {
    oneCompilerLanguage = ONECOMPILER_C_LANG;
    fileName = "main.c";
  } else if (languageId === CPP_LANGUAGE_ID_JUDGE0) {
    oneCompilerLanguage = ONECOMPILER_CPP_LANG;
    fileName = "main.cpp";
  }
  else if(languageId === 71){
    oneCompilerLanguage = "python";
    fileName = "main.py";
  }
  else {
    return {
      status: "error",
      message: `OneCompiler integration currently only supports C (ID ${C_LANGUAGE_ID_JUDGE0}) and C++ (ID ${CPP_LANGUAGE_ID_JUDGE0}). Received ${languageId}.`,
    };
  }

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
