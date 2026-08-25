"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai";
import { validateChatMessage } from "@/lib/chat/validation";
import { buildMaterialContext, buildTeacherSystemPrompt } from "@/lib/chat/prompt";
import { getChatMessages, getMaterialContextForSubject } from "@/lib/chat/queries";

export interface SendMessageState {
  error: string | null;
}

const MAX_HISTORY_TURNS = 20;

export async function sendMessageAction(
  _prevState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const studentId = String(formData.get("studentId") ?? "");
  const subject = String(formData.get("subject") ?? "");
  const content = String(formData.get("content") ?? "");

  const validation = validateChatMessage(content);
  if (!validation.valid) {
    return { error: validation.error ?? "Invalid message." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to chat." };
  }

  // Defense in depth: confirm this student belongs to the signed-in
  // parent before doing anything else, even though RLS also enforces it.
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("full_name, class_level")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError || !student) {
    return { error: "That student could not be found." };
  }

  const trimmedContent = content.trim();

  const { error: userInsertError } = await supabase.from("chat_messages").insert({
    student_id: studentId,
    subject,
    role: "user",
    content: trimmedContent,
  });
  if (userInsertError) {
    return { error: "Couldn't send your message. Please try again." };
  }

  try {
    const [history, materials] = await Promise.all([
      getChatMessages(studentId, subject),
      getMaterialContextForSubject(studentId, subject),
    ]);

    const systemPrompt = buildTeacherSystemPrompt({
      studentName: student.full_name,
      classLevel: student.class_level,
      subject,
      materialContext: buildMaterialContext(materials),
    });

    const recentHistory = history.slice(-MAX_HISTORY_TURNS).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const provider = getAIProvider();
    const reply = await provider.complete({
      systemPrompt,
      messages: recentHistory,
    });

    const { error: assistantInsertError } = await supabase.from("chat_messages").insert({
      student_id: studentId,
      subject,
      role: "assistant",
      content: reply,
    });
    if (assistantInsertError) {
      return { error: "Got a reply but couldn't save it. Please refresh." };
    }
  } catch {
    return { error: "The teacher couldn't respond right now. Please try again." };
  }

  revalidatePath(`/children/${studentId}/chat`);
  return { error: null };
}
