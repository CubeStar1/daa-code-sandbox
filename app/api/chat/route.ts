import { openai } from '@ai-sdk/openai';
import {
  type InferUITools,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  convertToModelMessages,
  streamText,
} from 'ai';
import { getWeather, createProblem, addProblemCategories, addTestCases, addEditorial } from './tools';
import { LEETCODE_GENERATOR_SYSTEM_PROMPT } from './prompts/leetcode-generator';
import { stepCountIs } from 'ai';

const tools = {
  getWeather,
  createProblem,
  addProblemCategories,
  addTestCases,
  addEditorial,
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4.1-mini'),
    system: LEETCODE_GENERATOR_SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools,
	stopWhen: stepCountIs(10)
  });

  return result.toUIMessageStreamResponse();
}