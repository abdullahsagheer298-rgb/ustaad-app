import { CLASS_LEVELS, type ClassLevel } from "./constants.ts";

export interface StudentInput {
  fullName: string;
  classLevel: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: { fullName?: string; classLevel?: string };
}

/**
 * Validates raw student profile input (e.g. straight from a form).
 * Pure function — no I/O — so it's cheap to unit test and can be reused
 * identically on the client (for inline form feedback, later) and the
 * server (as the real gate before writing to the database).
 */
export function validateStudentInput(input: StudentInput): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  const name = input.fullName.trim();
  if (name.length === 0) {
    errors.fullName = "Name is required.";
  } else if (name.length > 100) {
    errors.fullName = "Name is too long.";
  }

  if (!CLASS_LEVELS.includes(input.classLevel as ClassLevel)) {
    errors.classLevel = "Please choose a valid class.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
