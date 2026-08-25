import { test } from "node:test";
import assert from "node:assert/strict";
import { validateMaterialUpload } from "../lib/materials/validation.ts";

const validPdf = {
  subject: "Fractions",
  fileName: "chapter3.pdf",
  fileType: "application/pdf",
  fileSizeBytes: 1024 * 500,
};

test("accepts a valid PDF upload", () => {
  const result = validateMaterialUpload(validPdf);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test("rejects an empty subject", () => {
  const result = validateMaterialUpload({ ...validPdf, subject: "   " });
  assert.equal(result.valid, false);
  assert.equal(result.errors.subject, "Subject is required.");
});

test("rejects a missing file name", () => {
  const result = validateMaterialUpload({ ...validPdf, fileName: "" });
  assert.equal(result.valid, false);
  assert.equal(result.errors.file, "Please choose a file.");
});

test("rejects a file over the size limit", () => {
  const result = validateMaterialUpload({ ...validPdf, fileSizeBytes: 21 * 1024 * 1024 });
  assert.equal(result.valid, false);
  assert.match(result.errors.file ?? "", /too large/);
});

test("rejects a zero-byte file", () => {
  const result = validateMaterialUpload({ ...validPdf, fileSizeBytes: 0 });
  assert.equal(result.valid, false);
  assert.match(result.errors.file ?? "", /empty/);
});

test("rejects an unsupported file type", () => {
  const result = validateMaterialUpload({ ...validPdf, fileType: "application/zip" });
  assert.equal(result.valid, false);
  assert.match(result.errors.file ?? "", /Unsupported/);
});

test("accepts each allowed file type", () => {
  const types = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/png",
    "image/jpeg",
  ];
  for (const fileType of types) {
    const result = validateMaterialUpload({ ...validPdf, fileType });
    assert.equal(result.valid, true, `expected ${fileType} to be valid`);
  }
});
