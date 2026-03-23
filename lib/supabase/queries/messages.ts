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
  return messages.map((msg) => {
    // Build parts array
    const parts: any[] = [];
    
    // Add text part if content exists
    if (msg.content) {
      parts.push({ type: "text", text: msg.content });
    }
    
    // Add tool invocations if they exist
    if (msg.tool_invocations && Array.isArray(msg.tool_invocations)) {
      parts.push(...msg.tool_invocations);
    }
    
    return {
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content, // Keep content for compatibility
      parts: parts.length > 0 ? parts : [{ type: "text", text: "" }],
      createdAt: new Date(msg.created_at),
    };
  });
}
