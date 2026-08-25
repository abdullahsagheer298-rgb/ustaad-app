export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_MESSAGE_LENGTH = 4000;

/**
 * Validates a chat message before it's sent to the AI provider. Pure
 * function — no I/O — so it's cheap to unit test.
 */
export function validateChatMessage(content: string): ValidationResult {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Message can't be empty." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: "Message is too long." };
  }

  return { valid: true };
}
