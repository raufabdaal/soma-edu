"use client";

import { useState, useEffect } from "react";

interface SpeechButtonProps {
  text: string;
  className?: string;
}

export function SpeechButton({ text, className }: SpeechButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  const toggleSpeech = () => {
    if (!supported) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      // Attempt to find a natural sounding English voice
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
                       voices.find(v => v.lang.startsWith('en'));

      if (engVoice) utterance.voice = engVoice;

      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggleSpeech}
      className={`p-2 rounded-full hover:bg-primary/10 transition-colors ${className}`}
      title={speaking ? "Stop reading" : "Read aloud"}
    >
      {speaking ? (
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
          <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
