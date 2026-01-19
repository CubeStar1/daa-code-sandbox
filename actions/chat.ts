"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { UIMessage } from "ai";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  tool_invocations?: any;
  created_at: string;
}

// Save or create a conversation
export async function saveChat({
  id,
  title,
  userId,
}: {
  id: string;
  title: string;
  userId: string;
}): Promise<Conversation | null> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("conversations")
    .upsert({
      id,
      title,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving chat:", error);
    return null;
  }

  return data as Conversation;
}

// Get a conversation by ID
export async function getChatById(id: string): Promise<Conversation | null> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error getting chat:", error);
    return null;
  }

  return data as Conversation;
}

// Get all conversations for a user
export async function getUserConversations(
  userId: string
): Promise<Conversation[]> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error getting user conversations:", error);
    return [];
  }

  return data as Conversation[];
}

// Delete a conversation (cascade deletes messages)
export async function deleteChat(id: string): Promise<boolean> {
  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting chat:", error);
    return false;
  }

  return true;
}

// Save messages to a conversation
export async function saveMessages(
  messages: UIMessage[],
  conversationId: string
): Promise<boolean> {
  const supabase = await createSupabaseServer();

  const messagesToInsert = messages.map((msg) => ({
    id: msg.id,
    conversation_id: conversationId,
    role: msg.role,
    content: getMessageContent(msg),
    tool_invocations: msg.parts?.filter((p) => p.type.startsWith("tool-")) || null,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("messages")
    .upsert(messagesToInsert, { onConflict: "id" });

  if (error) {
    console.error("Error saving messages:", error);
    return false;
  }

  // Update conversation's updated_at timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return true;
}

// Get messages for a conversation
export async function getMessagesByConversationId(
  conversationId: string
): Promise<Message[]> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error getting messages:", error);
    return [];
  }

  return data as Message[];
}

// Generate a title from the first user message
export async function generateTitleFromUserMessage(
  message: UIMessage,
  model: string = "gpt-4o-mini"
): Promise<string> {
  const content = getMessageContent(message);

  try {
    const { text } = await generateText({
      model: openai(model),
      system: `Generate a very short title (3-6 words max) for a conversation that starts with this message. 
               Return only the title, no quotes or punctuation at the end.
               Be concise and descriptive.`,
      prompt: content.slice(0, 500), // Limit input length
    });

    return text.trim() || "New Chat";
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback: use first few words of the message
    const words = content.split(" ").slice(0, 5).join(" ");
    return words.length > 30 ? words.slice(0, 30) + "..." : words || "New Chat";
  }
}

// Helper function to extract text content from UIMessage
function getMessageContent(message: UIMessage): string {
  // UIMessage uses parts array, not direct content property
  if (message.parts && Array.isArray(message.parts)) {
    const textParts = message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as any).text)
      .join("\n");
    return textParts;
  }

  return "";
}
