import { test } from "node:test";
import assert from "node:assert/strict";
import { validateChatMessage } from "../lib/chat/validation.ts";

test("accepts a normal message", () => {
  const result = validateChatMessage("What is photosynthesis?");
  assert.equal(result.valid, true);
});

test("rejects an empty message", () => {
  const result = validateChatMessage("   ");
  assert.equal(result.valid, false);
  assert.match(result.error ?? "", /empty/);
});

test("rejects a message over the length limit", () => {
  const result = validateChatMessage("a".repeat(4001));
  assert.equal(result.valid, false);
  assert.match(result.error ?? "", /too long/);
});

test("accepts a message right at the length limit", () => {
  const result = validateChatMessage("a".repeat(4000));
  assert.equal(result.valid, true);
});
