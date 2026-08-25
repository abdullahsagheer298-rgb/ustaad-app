"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateStudentInput } from "@/lib/students/validation";

export interface AddStudentState {
  error: string | null;
  fieldErrors: { fullName?: string; classLevel?: string };
}

export async function addStudentAction(
  _prevState: AddStudentState,
  formData: FormData
): Promise<AddStudentState> {
  const fullName = String(formData.get("fullName") ?? "");
  const classLevel = String(formData.get("classLevel") ?? "");

  const validation = validateStudentInput({ fullName, classLevel });
  if (!validation.valid) {
    return { error: null, fieldErrors: validation.errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to add a child.", fieldErrors: {} };
  }

  const { error } = await supabase.from("students").insert({
    parent_id: user.id,
    full_name: fullName.trim(),
    class_level: classLevel,
  });

  if (error) {
    return { error: "Something went wrong saving that. Please try again.", fieldErrors: {} };
  }

  revalidatePath("/children");
  return { error: null, fieldErrors: {} };
}
