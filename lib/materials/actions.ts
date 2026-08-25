"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateMaterialUpload } from "@/lib/materials/validation";
import { extractText } from "@/lib/materials/extract-text";

export interface UploadMaterialState {
  error: string | null;
  fieldErrors: { subject?: string; file?: string };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadMaterialAction(
  _prevState: UploadMaterialState,
  formData: FormData
): Promise<UploadMaterialState> {
  const studentId = String(formData.get("studentId") ?? "");
  const subject = String(formData.get("subject") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: null, fieldErrors: { file: "Please choose a file." } };
  }

  const validation = validateMaterialUpload({
    subject,
    fileName: file.name,
    fileType: file.type,
    fileSizeBytes: file.size,
  });
  if (!validation.valid) {
    return { error: null, fieldErrors: validation.errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to upload material.", fieldErrors: {} };
  }

  // Defense in depth: confirm this student actually belongs to the
  // signed-in parent before touching storage, even though RLS would also
  // block a cross-account write. A clear error here beats an opaque
  // storage-policy rejection.
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError || !student) {
    return { error: "That student could not be found.", fieldErrors: {} };
  }

  const storagePath = `${user.id}/${studentId}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("study-materials")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Upload failed. Please try again.", fieldErrors: {} };
  }

  // Extraction failures degrade to null (no context for this file) rather
  // than failing the upload — the file itself is still valuable stored,
  // even if the teaching chat can't read it yet.
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const extractedText = await extractText(fileBuffer, file.type);

  const { error: insertError } = await supabase.from("study_materials").insert({
    student_id: studentId,
    subject: subject.trim(),
    file_name: file.name,
    storage_path: storagePath,
    file_type: file.type,
    file_size_bytes: file.size,
    extracted_text: extractedText,
  });

  if (insertError) {
    // Clean up the orphaned file so storage doesn't accumulate
    // untracked uploads if the metadata write fails.
    await supabase.storage.from("study-materials").remove([storagePath]);
    return { error: "Something went wrong saving that. Please try again.", fieldErrors: {} };
  }

  revalidatePath(`/children/${studentId}`);
  return { error: null, fieldErrors: {} };
}
