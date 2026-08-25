import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "./constants.ts";

export interface MaterialUploadInput {
  subject: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: { subject?: string; file?: string };
}

/**
 * Validates a study material upload. Deliberately takes plain values
 * (extracted from a File/FormData upstream) rather than a File object
 * itself, so this stays a pure function that's trivial to unit test.
 */
export function validateMaterialUpload(input: MaterialUploadInput): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  const subject = input.subject.trim();
  if (subject.length === 0) {
    errors.subject = "Subject is required.";
  } else if (subject.length > 100) {
    errors.subject = "Subject is too long.";
  }

  if (!input.fileName) {
    errors.file = "Please choose a file.";
  } else if (input.fileSizeBytes <= 0) {
    errors.file = "That file appears to be empty.";
  } else if (input.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    errors.file = "File is too large — the limit is 20 MB.";
  } else if (!(input.fileType in ALLOWED_FILE_TYPES)) {
    errors.file = "Unsupported file type. Use PDF, Word, text, or an image.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
