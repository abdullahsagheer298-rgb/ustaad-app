"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { sendMessageAction, type SendMessageState } from "@/lib/chat/actions";
import type { ChatMessageRow } from "@/lib/chat/queries";
import {
  useSpeechToText,
  useTextToSpeech,
  type SpeechLanguage,
  type AzureSpeechStatus,
} from "@/lib/chat/use-speech";

const initialState: SendMessageState = { error: null };

export function ChatPanel({
  studentId,
  subject,
  initialMessages,
}: {
  studentId: string;
  subject: string;
  initialMessages: ChatMessageRow[];
}) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<SpeechLanguage>("en-US");
  const [urduVoiceStatus, setUrduVoiceStatus] = useState<AzureSpeechStatus | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  const speechToText = useSpeechToText((transcript) => {
    setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, language);
  const textToSpeech = useTextToSpeech();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages.length, pending]);

  async function readAloud(text: string) {
    const status = await textToSpeech.speak(text, language);
    if (language === "ur-PK") setUrduVoiceStatus(status);
  }

  // Automatically read the newest teacher reply aloud — Saifullah can't
  // read yet, so hearing the answer matters as much as seeing it.
  useEffect(() => {
    const last = initialMessages[initialMessages.length - 1];
    if (last && last.role === "assistant" && last.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = last.id;
      readAloud(last.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- readAloud is stable in practice; including it would re-run this on every render.
  }, [initialMessages, language]);

  const showUrduVoiceWarning = language === "ur-PK" && urduVoiceStatus && urduVoiceStatus !== "ok";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500">Voice language:</span>
        <button
          type="button"
          onClick={() => {
            setLanguage("en-US");
            setUrduVoiceStatus(null);
          }}
          className={
            language === "en-US"
              ? "rounded bg-neutral-900 px-3 py-1 text-white"
              : "rounded border border-neutral-300 px-3 py-1 hover:bg-neutral-50"
          }
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage("ur-PK")}
          className={
            language === "ur-PK"
              ? "rounded bg-neutral-900 px-3 py-1 text-white"
              : "rounded border border-neutral-300 px-3 py-1 hover:bg-neutral-50"
          }
        >
          اردو (Urdu)
        </button>
      </div>

      {showUrduVoiceWarning && (
        <p className="text-xs text-amber-700">
          {urduVoiceStatus === "unconfigured"
            ? "Urdu voice playback isn't set up on this site yet."
            : "Couldn't reach the Urdu voice service just now — typing and reading still work fine."}
        </p>
      )}

      <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto rounded border border-neutral-200 p-4">
        {initialMessages.length === 0 && (
          <p className="text-sm text-neutral-500">
            Ask your teacher anything about {subject} — start below, or tap the microphone to
            speak.
          </p>
        )}
        {initialMessages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "self-end rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white"
                : "flex max-w-[85%] items-start gap-2 self-start rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
            }
          >
            <span className="whitespace-pre-wrap">{m.content}</span>
            {m.role === "assistant" && textToSpeech.supported && (
              <button
                type="button"
                onClick={() => readAloud(m.content)}
                aria-label="Read this answer aloud again"
                title="Read aloud"
                className="shrink-0 text-neutral-400 hover:text-neutral-700"
              >
                🔊
              </button>
            )}
          </div>
        ))}
        {pending && <p className="text-sm italic text-neutral-500">Your teacher is thinking…</p>}
        <div ref={endRef} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {speechToText.supported === false && (
        <p className="text-xs text-neutral-400">
          Voice input isn&apos;t supported in this browser — try Chrome or Edge for the
          microphone button.
        </p>
      )}

      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          setContent("");
          formRef.current?.reset();
        }}
        className="flex gap-2"
      >
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="subject" value={subject} />
        <textarea
          name="content"
          required
          disabled={pending}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ask a question, or tap the microphone to speak…"
          dir={language === "ur-PK" ? "rtl" : "ltr"}
          className="h-16 flex-1 resize-none rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        {speechToText.supported && (
          <button
            type="button"
            onClick={() => (speechToText.listening ? speechToText.stop() : speechToText.start())}
            disabled={pending}
            aria-label={speechToText.listening ? "Stop listening" : "Speak your question"}
            title={speechToText.listening ? "Listening… tap to stop" : "Tap to speak"}
            className={
              speechToText.listening
                ? "self-end rounded bg-red-600 px-3 py-2 text-sm text-white"
                : "self-end rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
            }
          >
            {speechToText.listening ? "● Listening…" : "🎤"}
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="self-end rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
