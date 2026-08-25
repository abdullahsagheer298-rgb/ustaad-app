import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { MaterialExcerpt } from "@/lib/chat/prompt";

export type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

/**
 * Returns the chat history for a student+subject, oldest first (ready to
 * render top-to-bottom or pass to the AI provider as conversation turns).
 */
export async function getChatMessages(
  studentId: string,
  subject: string
): Promise<ChatMessageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("student_id", studentId)
    .eq("subject", subject)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load chat history: ${error.message}`);
  return data ?? [];
}

/**
 * Returns extracted text for a student's materials in a subject, most
 * recently uploaded first — the shape buildMaterialContext expects.
 */
export async function getMaterialContextForSubject(
  studentId: string,
  subject: string
): Promise<MaterialExcerpt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_materials")
    .select("file_name, extracted_text")
    .eq("student_id", studentId)
    .eq("subject", subject)
    .not("extracted_text", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load material context: ${error.message}`);

  return (data ?? [])
    .filter((m): m is { file_name: string; extracted_text: string } => Boolean(m.extracted_text))
    .map((m) => ({ fileName: m.file_name, text: m.extracted_text }));
}
