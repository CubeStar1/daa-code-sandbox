import { createSupabaseBrowser } from "../client";
import type { Message } from "@/actions/chat";

// Fetch all messages for a conversation (browser-side)
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = createSupabaseBrowser();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data as Message[];
}

// Convert database messages to UIMessage format for useChat
export function convertToUIMessages(messages: Message[]): any[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    parts: [
      { type: "text", text: msg.content },
      ...(msg.tool_invocations || []),
    ],
  }));
}
