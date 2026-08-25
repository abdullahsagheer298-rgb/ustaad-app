import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Student = Database["public"]["Tables"]["students"]["Row"];

/**
 * Returns the signed-in parent's students, newest first.
 * Relies entirely on Row Level Security to scope results — no manual
 * parent_id filter here, so this can never accidentally leak across
 * accounts even if called incorrectly.
 */
export async function getStudentsForCurrentUser(): Promise<Student[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load students: ${error.message}`);
  return data ?? [];
}
