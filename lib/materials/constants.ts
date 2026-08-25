/**
 * Upload limits and allowed types for study material.
 * Single source of truth — used by both client-side validation feedback
 * and the real server-side gate in lib/materials/validation.ts.
 */
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const ALLOWED_FILE_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
  "text/plain": "Text file",
  "image/png": "Image",
  "image/jpeg": "Image",
};
