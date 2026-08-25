/**
 * Supabase-generated database types.
 *
 * This is a hand-written placeholder matching migrations 0001 and 0002.
 * Once a real Supabase project is linked, regenerate this file for real
 * with:
 *
 *   npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
 *
 * Do that after every migration so the app's types stay in sync with the
 * actual schema. See SETUP.md.
 *
 * Note: `Relationships` is required by the Supabase client's type
 * definitions even when a table has no foreign-key relationships modeled
 * here yet — leave it as an empty array in that case.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "parent" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "parent" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: "parent" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          parent_id: string;
          full_name: string;
          class_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          full_name: string;
          class_level: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          full_name?: string;
          class_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      study_materials: {
        Row: {
          id: string;
          student_id: string;
          subject: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size_bytes: number;
          extracted_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size_bytes: number;
          extracted_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject?: string;
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size_bytes?: number;
          extracted_text?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_materials_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          student_id: string;
          subject: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
