"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Feedback {
  grade: string;
  score: number;
  outOf: number;
  percentage: number;
  feedback: string;
  keyPointsEarned: string[];
  keyPointsMissed: string[];
  improvedAnswer: string;
}

// The sample exam question shown to the student
const SAMPLE_QUESTION = {
  subject: "Biology",
  paper: "Paper 1 • 2023 UNEB",
  marks: 4,
  text: "Define osmosis and explain its importance in plant cells.",
};

export default function PastPaperPractice() {
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleSubmit = async () => {
    if (!answer || !user) return;
    setLoading(true);
    console.log("[PracticeePage] Submitting answer for AI marking:", answer);
    try {
      const res = await fetch("/api/ai/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: "q_sample_bio_s3",
          studentAnswer: answer,
          studentId: user.uid,
        }),
      });
      const data = await res.json();
      console.log("[PracticePage] AI feedback received:", data);
      setFeedback(data);
    } catch (err) {
      console.error("[PracticePage] Error getting feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  // Score color helper: green for high, orange for mid, red for low
  const scoreColor = feedback
    ? feedback.percentage >= 70
      ? "text-emerald-600"
      : feedback.percentage >= 40
      ? "text-orange-500"
      : "text-red-600"
    : "text-indigo-600";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Subtle page glow */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-orange-500/3 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-4xl animate-premium-slide">
        {/* Page Header */}
        <div className="mb-10">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 rounded-full border border-orange-100/60">
            Past Paper Practice
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3">
            AI Marking Engine
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Answer authentic UNEB exam questions and get instant structured feedback.
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.015)] mb-8">
          {/* Question metadata */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-black rounded-xl border border-orange-100/60 uppercase tracking-wider">
                {SAMPLE_QUESTION.subject} S3
              </span>
              <span className="text-xs font-bold text-slate-400">{SAMPLE_QUESTION.paper}</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {SAMPLE_QUESTION.marks} Marks
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-8 leading-relaxed">
            {SAMPLE_QUESTION.text}
          </h2>

          {/* Answer textarea */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your full answer here. Be thorough — the AI marks based on key scientific points..."
              className="w-full h-52 p-5 rounded-2xl border border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none bg-slate-50/50 focus:bg-white resize-none text-sm text-slate-800 font-medium leading-relaxed transition-all"
              disabled={loading || !!feedback}
            />
          </div>

          {!feedback && (
            <button
              onClick={handleSubmit}
              disabled={loading || !answer}
              className="mt-6 w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing your answer...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Submit for AI Marking
                </>
              )}
            </button>
          )}
        </div>

        {/* Feedback Card — only shown after submission */}
        {feedback && (
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.015)] animate-premium-slide space-y-8">
            {/* Score Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                {/* Grade badge */}
                <div className={`w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center ${scoreColor}`}>
                  <span className="text-5xl font-black">{feedback.grade}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">AI Feedback</p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {feedback.score}/{feedback.outOf || 4} Marks
                  </h3>
                  <p className="text-sm font-bold text-slate-400 mt-0.5">{feedback.percentage}% achieved</p>
                </div>
              </div>
              {/* Score ring visualisation */}
              <div className="hidden sm:block relative w-16 h-16">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    strokeDasharray={`${feedback.percentage}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke={feedback.percentage >= 70 ? "#16a34a" : feedback.percentage >= 40 ? "#f97316" : "#dc2626"}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700">
                  {feedback.percentage}%
                </span>
              </div>
            </div>

            {/* Narrative feedback */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Analysis</p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{feedback.feedback}</p>
            </div>

            {/* Key points — two column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-100/60">
                <h5 className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12" /></svg>
                  Points Earned
                </h5>
                <ul className="space-y-2.5">
                  {feedback.keyPointsEarned?.map((pt: string, i: number) => (
                    <li key={i} className="text-sm text-emerald-900 flex gap-2 leading-relaxed font-medium">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-red-50/60 rounded-2xl border border-red-100/60">
                <h5 className="text-xs font-black text-red-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  Points Missed
                </h5>
                <ul className="space-y-2.5">
                  {feedback.keyPointsMissed?.map((pt: string, i: number) => (
                    <li key={i} className="text-sm text-red-900 flex gap-2 leading-relaxed font-medium">
                      <span className="text-red-500 shrink-0 mt-0.5">×</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Model Answer */}
            <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider mb-3">
                Model Answer
              </h4>
              <p className="text-sm italic text-indigo-900 leading-relaxed font-medium">
                {feedback.improvedAnswer}
              </p>
            </div>

            {/* Try again button */}
            <button
              onClick={() => { setFeedback(null); setAnswer(""); }}
              className="w-full h-13 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl font-bold text-slate-700 transition-all active:scale-[0.98]"
            >
              Try Another Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
