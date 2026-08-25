import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMaterialContext, buildTeacherSystemPrompt } from "../lib/chat/prompt.ts";

test("buildMaterialContext concatenates multiple materials with filenames", () => {
  const context = buildMaterialContext([
    { fileName: "notes.pdf", text: "Fractions are parts of a whole." },
    { fileName: "worksheet.docx", text: "Practice: 1/2 + 1/4" },
  ]);
  assert.match(context, /notes\.pdf/);
  assert.match(context, /worksheet\.docx/);
  assert.match(context, /Fractions are parts of a whole/);
  assert.match(context, /Practice: 1\/2 \+ 1\/4/);
});

test("buildMaterialContext returns empty string for no materials", () => {
  assert.equal(buildMaterialContext([]), "");
});

test("buildMaterialContext truncates when total exceeds the character budget", () => {
  const huge = "x".repeat(10000);
  const context = buildMaterialContext([{ fileName: "big.pdf", text: huge }]);
  assert.ok(context.length < huge.length);
});

test("buildTeacherSystemPrompt includes student name, class, and subject", () => {
  const prompt = buildTeacherSystemPrompt({
    studentName: "Sara",
    classLevel: "Class 5",
    subject: "Fractions",
    materialContext: "Fractions are parts of a whole.",
  });
  assert.match(prompt, /Sara/);
  assert.match(prompt, /Class 5/);
  assert.match(prompt, /Fractions/);
  assert.match(prompt, /Fractions are parts of a whole/);
});

test("buildTeacherSystemPrompt notes when no material has been uploaded", () => {
  const prompt = buildTeacherSystemPrompt({
    studentName: "Ali",
    classLevel: "Class 8",
    subject: "History",
    materialContext: "",
  });
  assert.match(prompt, /No study material has been uploaded/);
});

test("buildTeacherSystemPrompt instructs replying in the student's language", () => {
  const prompt = buildTeacherSystemPrompt({
    studentName: "Saifullah",
    classLevel: "Class 1",
    subject: "Math",
    materialContext: "",
  });
  assert.match(prompt, /same language/i);
  assert.match(prompt, /Urdu/);
});
