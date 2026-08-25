import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type MaterialRow = Database["public"]["Tables"]["study_materials"]["Row"];

/**
 * Returns a single student by id, or null if it doesn't exist OR doesn't
 * belong to the signed-in parent. RLS makes those two cases
 * indistinguishable from here, which is exactly the behavior we want —
 * a parent probing another family's student id should see "not found",
 * not a permissions error that confirms the id is valid.
 */
export async function getStudentById(studentId: string): Promise<StudentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load student: ${error.message}`);
  return data;
}

/**
 * Returns study materials for a given student, newest first. Relies on
 * RLS (via the students EXISTS check in the migration) to enforce
 * ownership — callers should still confirm getStudentById() succeeded
 * first so the page can render a clean "not found" rather than an empty
 * list that looks like "no materials yet".
 */
export async function getMaterialsForStudent(studentId: string): Promise<MaterialRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load materials: ${error.message}`);
  return data ?? [];
}
