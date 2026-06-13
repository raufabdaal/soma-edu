"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AiTutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          topicId: "general_study",
          subjectId: "all",
          conversationHistory: messages,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-120px)] flex flex-col">
      <div className="bg-card border rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
        <header className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold">AI Study Tutor</h2>
            <p className="text-xs text-muted-foreground">Expert assistance for UNEB exams</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <p className="text-lg font-bold text-muted-foreground">How can I help you study today?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Explain photosynthesis", "Solve quadratic equations", "UNEB exam tips"].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="px-4 py-2 bg-background border rounded-full text-xs font-bold hover:border-primary transition-colors shadow-sm"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-background border rounded-tl-none"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-background border p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t bg-background">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary outline-none text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 bg-primary text-primary-foreground rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
