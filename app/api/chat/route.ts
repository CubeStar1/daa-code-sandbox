import { openai } from '@ai-sdk/openai';
import {
  type InferUITools,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  convertToModelMessages,
  streamText,
} from 'ai';
import { 
  getWeather, 
  createProblem, 
  addProblemCategories, 
  addTestCases, 
  addEditorial,
  generateHints,
  explainError,
  suggestOptimization
} from './tools';
import { COMBINED_SYSTEM_PROMPT } from './prompts/assistant-helper';
import { stepCountIs } from 'ai';
import {
  saveChat,
  saveMessages,
  getChatById,
  generateTitleFromUserMessage,
} from '@/actions/chat';

// Editor context passed from frontend when user clicks "Help me"
export interface EditorContext {
  problemTitle?: string;
  problemDescription?: string;
  code?: string;
  language?: string;
  output?: string;
  testResults?: {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
  }[];
}

const tools = {
  getWeather,
  // Problem creation tools
  createProblem,
  addProblemCategories,
  addTestCases,
  addEditorial,
  // User assistance tools
  generateHints,
  explainError,
  suggestOptimization,
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  const { 
    messages, 
    editorContext,
    conversationId,
    userId 
  }: { 
    messages: ChatMessage[]; 
    editorContext?: EditorContext;
    conversationId?: string;
    userId?: string;
  } = await req.json();

  // Build system prompt based on whether we have editor context
  let systemPrompt = COMBINED_SYSTEM_PROMPT;
  
  if (editorContext) {
    systemPrompt += `\n\n## Current User Context\n`;
    
    if (editorContext.problemTitle) {
      systemPrompt += `\n**Problem:** ${editorContext.problemTitle}\n`;
    }
    if (editorContext.problemDescription) {
      systemPrompt += `\n**Description:**\n${editorContext.problemDescription.slice(0, 500)}...\n`;
    }
    if (editorContext.code) {
      systemPrompt += `\n**User's Code (${editorContext.language || 'unknown'}):**\n\`\`\`${editorContext.language || ''}\n${editorContext.code}\n\`\`\`\n`;
    }
    if (editorContext.output) {
      systemPrompt += `\n**Last Output/Error:**\n\`\`\`\n${editorContext.output}\n\`\`\`\n`;
    }
    if (editorContext.testResults && editorContext.testResults.length > 0) {
      const failedTests = editorContext.testResults.filter(t => !t.passed);
      if (failedTests.length > 0) {
        systemPrompt += `\n**Failed Test Cases:**\n`;
        failedTests.slice(0, 3).forEach((t, i) => {
          systemPrompt += `- Test ${i + 1}: Input: ${t.input.slice(0, 100)}, Expected: ${t.expected.slice(0, 50)}, Got: ${t.actual.slice(0, 50)}\n`;
        });
      }
    }
    
    systemPrompt += `\nThe user is asking for help with this problem. Use the appropriate tool to assist them.`;
  }

  // Get the last user message for title generation and saving
  const userMessage = messages[messages.length - 1];

  // Handle conversation persistence if conversationId and userId are provided
  // Do this BEFORE streaming starts to stay within request scope
  let chatSaved = false;
  if (conversationId && userId && userMessage) {
    try {
      const existingChat = await getChatById(conversationId);

      if (!existingChat) {
        // New conversation - generate title and create it
        const title = await generateTitleFromUserMessage(userMessage);
        await saveChat({ id: conversationId, title, userId });
      }

      // Save the user's message
      await saveMessages([userMessage], conversationId);
      chatSaved = true;
    } catch (error) {
      console.error("Error saving chat/message:", error);
      // Continue with the request even if persistence fails
    }
  }

  // Create the streaming response using the simple pattern
  // convertToModelMessages is async in AI SDK 6
  const modelMessages = await convertToModelMessages(messages);
  
  const result = streamText({
    model: openai('gpt-4.1-mini'),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10),
    onFinish: async ({ response }) => {
      // Save assistant response after streaming completes
      if (conversationId && userId && chatSaved) {
        try {
          // response.messages contains the assistant's messages
          const assistantMessages = response.messages.map((msg) => ({
            id: crypto.randomUUID(), // Generate new UUID since ResponseMessage doesn't have id
            role: msg.role as 'user' | 'assistant',
            content: typeof msg.content === 'string' 
              ? msg.content 
              : msg.content.map((c: any) => c.type === 'text' ? c.text : '').join(''),
            parts: typeof msg.content === 'string'
              ? [{ type: 'text' as const, text: msg.content }]
              : msg.content.map((c: any) => {
                  if (c.type === 'text') return { type: 'text' as const, text: c.text };
                  if (c.type === 'tool-call') return { type: 'tool-invocation' as const, ...c };
                  return c;
                }),
          }));
          
          await saveMessages(assistantMessages as any, conversationId);
        } catch (error) {
          console.error("Error saving assistant response:", error);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
