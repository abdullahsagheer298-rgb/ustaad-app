import "server-only";
import { env } from "@/lib/config/env";
import type { AIProvider, CompletionRequest } from "@/lib/ai/types";

/**
 * Anthropic (Claude) implementation of AIProvider.
 *
 * This file is the ONLY place that should know about Anthropic's request/
 * response shape. Server-only: the API key must never reach the browser.
 */
export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private model = "claude-sonnet-4-6";

  constructor() {
    this.apiKey = env.ai.anthropicApiKey();
  }

  async complete({ systemPrompt, messages, maxTokens = 1000 }: CompletionRequest): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${body}`);
    }

    const data = await res.json();
    const textBlock = data.content?.find((block: { type: string }) => block.type === "text");
    if (!textBlock) throw new Error("Anthropic response contained no text block");
    return textBlock.text;
  }
}
