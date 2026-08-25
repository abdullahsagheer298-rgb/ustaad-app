import "server-only";
import { env } from "@/lib/config/env";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic-provider";
import type { AIProvider } from "@/lib/ai/types";

export type { AIProvider, AIProvider as default } from "@/lib/ai/types";
export type { ChatMessage, CompletionRequest } from "@/lib/ai/types";

/**
 * Returns the AI provider configured via the AI_PROVIDER env var.
 * Defaults to Anthropic. To add a new provider: implement AIProvider in
 * lib/ai/providers/, add a case below, done — nothing else in the app
 * needs to change.
 */
export function getAIProvider(): AIProvider {
  const provider = env.ai.provider();

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider();
    default:
      throw new Error(`Unknown AI_PROVIDER: "${provider}"`);
  }
}
