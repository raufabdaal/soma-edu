"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PastPaperPractice() {
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleSubmit = async () => {
    if (!answer || !user) return;
    setLoading(true);
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
      setFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">Biology S3 • 2023 Paper 1</span>
            <span className="font-bold text-muted-foreground">4 Marks</span>
          </div>
          <h2 className="text-xl font-bold mb-8">Define osmosis and explain its importance in plant cells.</h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-48 p-4 rounded-xl border focus:ring-2 focus:ring-primary outline-none bg-background resize-none"
            disabled={loading || feedback}
          />

          {!feedback && (
            <button
              onClick={handleSubmit}
              disabled={loading || !answer}
              className="mt-6 w-full py-4 bg-primary text-primary-foreground rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? "Marking Answer..." : "Submit for AI Marking"}
            </button>
          )}
        </div>

        {feedback && (
          <div className="bg-card border rounded-2xl p-8 shadow-sm animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-black text-primary">{feedback.grade}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Feedback</h3>
                  <p className="text-sm text-muted-foreground">Score: {feedback.score}/{feedback.outOf || 4} ({feedback.percentage}%)</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Analysis</h4>
                <p className="leading-relaxed">{feedback.feedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <h5 className="text-xs font-bold text-green-700 uppercase mb-3">Key Points Earned</h5>
                  <ul className="space-y-2">
                    {feedback.keyPointsEarned?.map((pt: string, i: number) => (
                      <li key={i} className="text-sm text-green-900 flex gap-2">
                        <span>✓</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h5 className="text-xs font-bold text-red-700 uppercase mb-3">Points Missed</h5>
                  <ul className="space-y-2">
                    {feedback.keyPointsMissed?.map((pt: string, i: number) => (
                      <li key={i} className="text-sm text-red-900 flex gap-2">
                        <span>×</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="text-sm font-bold text-primary uppercase mb-3">Improved Model Answer</h4>
                <p className="text-sm italic leading-relaxed">{feedback.improvedAnswer}</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => { setFeedback(null); setAnswer(""); }}
                  className="flex-1 py-3 border-2 rounded-xl font-bold hover:bg-muted transition-colors"
                >
                  Try Another Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
