/**
 * Provider-agnostic AI interface.
 *
 * Every AI feature in the app (teaching chat, quiz generation, progress
 * summaries, etc.) should depend on this interface — never on a specific
 * vendor SDK. To switch providers later, write a new class that implements
 * `AIProvider` and change one line in `lib/ai/index.ts`.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  systemPrompt: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

export interface AIProvider {
  /** Returns the model's full text response for a single turn. */
  complete(request: CompletionRequest): Promise<string>;
}
