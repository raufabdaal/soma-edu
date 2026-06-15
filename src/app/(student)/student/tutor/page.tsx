"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Message {
  role: "user" | "model";
  content: string;
}

// Quick suggestion prompts shown when the chat is empty
const PROMPT_SUGGESTIONS = [
  "Explain photosynthesis step by step",
  "How do I solve quadratic equations?",
  "Give me UNEB exam tips for Biology",
  "What is osmosis?",
];

export default function AiTutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever a new message appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const sentInput = input; // capture before clearing
    setInput("");
    setLoading(true);

    console.log("[AiTutor] Sending message:", sentInput);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sentInput,
          topicId: "general_study",
          subjectId: "all",
          conversationHistory: messages,
        }),
      });
      const data = await res.json();
      console.log("[AiTutor] Response received:", data.reply?.slice(0, 80));
      setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch (err) {
      console.error("[AiTutor] Network error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I couldn't connect right now. Please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 60px)" }}>
      {/* Chat area takes all available height */}
      <div className="flex-1 overflow-hidden flex flex-col container mx-auto p-4 md:p-8 max-w-4xl">

        {/* Chat container card */}
        <div className="bg-white border border-slate-100 rounded-[32px] flex-1 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)]">

          {/* Chat header */}
          <div className="flex items-center gap-4 px-8 py-5 border-b border-slate-50">
            <div className="relative">
              {/* Violet icon with glow */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" strokeWidth="2.5" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              {/* Green online indicator dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">AI Study Tutor</h2>
              <p className="text-xs text-slate-400 font-medium">Expert assistance for UNEB O-Level exams</p>
            </div>
            {/* Model badge */}
            <div className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-100/60 rounded-xl animate-pulse">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-700">Gemini 1.5 Flash</span>
            </div>
          </div>

          {/* Messages scroll area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-slate-50/40">

            {/* Empty state with prompt suggestions */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-100/60 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="#7c3aed" strokeWidth="2" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800 mb-1">How can I help you study today?</p>
                  <p className="text-sm text-slate-400 font-medium">Ask me anything about your O-Level subjects.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                  {PROMPT_SUGGESTIONS.map((hint) => (
                    <button
                      key={hint}
                      onClick={() => setInput(hint)}
                      className="px-4 py-2 bg-white border border-slate-100 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 rounded-2xl text-xs font-bold text-slate-600 transition-all shadow-sm"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"} animate-premium-fade`}
              >
                {/* Model avatar */}
                {m.role === "model" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm shadow-violet-500/20">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="white" strokeWidth="2.5" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                )}

                <div
                  className={`max-w-[78%] px-5 py-3.5 text-sm leading-relaxed font-medium ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-2xl rounded-tr-md shadow-md shadow-indigo-500/20"
                      : "bg-white text-slate-800 rounded-2xl rounded-tl-md border border-slate-100 shadow-sm"
                  }`}
                >
                  {m.content}
                </div>

                {/* User avatar */}
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mt-1 font-black text-indigo-600 text-sm">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 justify-start animate-premium-fade">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/20">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="white" strokeWidth="2.5" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input footer */}
          <div className="px-6 py-4 border-t border-slate-50 bg-white">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-3 items-end"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your O-Level subjects..."
                className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
