import { test } from "node:test";
import assert from "node:assert/strict";
import { validateStudentInput } from "../lib/students/validation.ts";

test("accepts a valid name and class level", () => {
  const result = validateStudentInput({ fullName: "Ahmed Jr.", classLevel: "Class 3" });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test("rejects an empty name", () => {
  const result = validateStudentInput({ fullName: "   ", classLevel: "Class 3" });
  assert.equal(result.valid, false);
  assert.equal(result.errors.fullName, "Name is required.");
});

test("rejects a name over 100 characters", () => {
  const result = validateStudentInput({ fullName: "a".repeat(101), classLevel: "Class 3" });
  assert.equal(result.valid, false);
  assert.equal(result.errors.fullName, "Name is too long.");
});

test("rejects a class level not in the fixed list", () => {
  const result = validateStudentInput({ fullName: "Sara", classLevel: "Kindergarten" });
  assert.equal(result.valid, false);
  assert.equal(result.errors.classLevel, "Please choose a valid class.");
});

test("rejects both fields at once independently", () => {
  const result = validateStudentInput({ fullName: "", classLevel: "" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.classLevel);
});
