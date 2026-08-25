/**
 * The fixed list of class levels a student profile can be assigned.
 * Single source of truth — used by both the form UI and server-side
 * validation, so they can never drift out of sync.
 */
export const CLASS_LEVELS = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Higher Classes",
] as const;

export type ClassLevel = (typeof CLASS_LEVELS)[number];
