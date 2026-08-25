import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/config/env";

// A general-purpose ElevenLabs premade voice. Uses the standard
// multilingual model (broadly available on all account tiers) rather
// than eleven_v3, which returned 401s on this account — likely a
// plan/API-access restriction on v3 specifically, not a bad key.
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // "Rachel"
const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";

const MAX_TEXT_LENGTH = 2000;

/**
 * Converts Urdu text to speech via ElevenLabs, since no browser ships a
 * built-in Urdu voice. Requires ELEVENLABS_API_KEY — returns 501 if
 * unset, so the feature degrades cleanly rather than breaking the rest
 * of the app. Chosen over Azure specifically because ElevenLabs' free
 * tier needs no credit card to get started. Uses eleven_multilingual_v2
 * rather than eleven_v3 — v3 returned 401s on this account, likely an
 * API-access restriction on v3 specifically for this account tier.
 * Urdu is not on multilingual_v2's officially documented language list,
 * so pronunciation quality is not guaranteed.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const apiKey = env.speech.elevenLabsApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Urdu voice isn't configured on this deployment yet." },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
  }
  const trimmedText = text.slice(0, MAX_TEXT_LENGTH);

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: ELEVENLABS_MODEL_ID,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("ElevenLabs TTS request failed:", res.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs request failed: ${errorText}` },
        { status: 502 }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the voice service." }, { status: 502 });
  }
}
