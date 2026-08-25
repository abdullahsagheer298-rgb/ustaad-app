"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechLanguage = "en-US" | "ur-PK";

// The Web Speech API types aren't in the standard DOM lib yet, and only
// Chromium browsers expose it under the "webkit" prefix. This is a
// deliberately minimal shape covering only what this hook uses.
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike }; length: number };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Voice input: tap to talk, get the transcribed text back. Only supported
 * in Chromium-based browsers today (Chrome, Edge) — `supported` tells the
 * caller whether to show the mic button at all. Recognition quality for
 * Urdu depends on Chrome's speech service and generally works even where
 * on-device Urdu text-to-speech voices don't exist.
 */
export function useSpeechToText(onResult: (text: string) => void, language: SpeechLanguage) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // One-time browser feature detection; must run after mount to avoid
    // an SSR/client hydration mismatch (server has no `window`).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(getSpeechRecognitionConstructor() !== null);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [onResult, language]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}

export type AzureSpeechStatus = "ok" | "unconfigured" | "error";

/**
 * Voice output. English uses the browser's built-in text-to-speech
 * (broadly supported). Urdu falls back to a server call to Azure's
 * cloud voice when the device has no Urdu voice installed — `speak`
 * handles that choice internally and reports back what actually
 * happened via the returned status, so the UI can show an honest
 * message rather than silently failing.
 */
export function useTextToSpeech() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    // Voice lists load asynchronously in some browsers.
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const hasVoiceFor = useCallback(
    (language: SpeechLanguage) =>
      voices.some((v) => v.lang.toLowerCase().startsWith(language.split("-")[0])),
    [voices]
  );

  const speakViaAzure = useCallback(async (text: string): Promise<AzureSpeechStatus> => {
    try {
      const res = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.status === 501) return "unconfigured";
      if (!res.ok) return "error";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      await audio.play();
      return "ok";
    } catch {
      return "error";
    }
  }, []);

  /**
   * Speaks text in the given language. For Urdu without a local voice,
   * uses Azure and returns its status; otherwise uses the browser voice
   * and returns "ok" (or "unconfigured" if speech synthesis isn't
   * available at all, which `supported` already reflects).
   */
  const speak = useCallback(
    async (text: string, language: SpeechLanguage): Promise<AzureSpeechStatus> => {
      if (language === "ur-PK" && !hasVoiceFor("ur-PK")) {
        return speakViaAzure(text);
      }
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return "unconfigured";
      window.speechSynthesis.cancel(); // don't overlap with a previous utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(language.split("-")[0]));
      if (match) utterance.voice = match;
      window.speechSynthesis.speak(utterance);
      return "ok";
    },
    [voices, hasVoiceFor, speakViaAzure]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    audioRef.current?.pause();
  }, []);

  return { supported, speak, stop, hasVoiceFor };
}
