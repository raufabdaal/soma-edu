"use client";

import { useState } from "react";

interface WorkedExampleBlockProps {
  problem: string;
  steps: string[];
  answer: string;
}

export function WorkedExampleBlock({ problem, steps, answer }: WorkedExampleBlockProps) {
  const [visibleStepCount, setVisibleStepCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNextStep = () => {
    if (visibleStepCount < steps.length) {
      setVisibleStepCount(visibleStepCount + 1);
    } else {
      setShowAnswer(true);
    }
  };

  return (
    <div className="mb-8 border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-muted/50 p-6 border-b">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">Worked Example</span>
        <h4 className="text-lg font-bold leading-tight">{problem}</h4>
      </div>

      <div className="p-6 space-y-4 bg-card">
        {steps.slice(0, visibleStepCount).map((step, index) => (
          <div
            key={index}
            className="flex gap-4 animate-in slide-in-from-left-4 fade-in duration-300"
          >
            <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 text-primary text-xs font-bold rounded">
              {index + 1}
            </span>
            <p className="text-sm md:text-base leading-relaxed text-foreground/80">{step}</p>
          </div>
        ))}

        {showAnswer && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in zoom-in-95 duration-300">
            <span className="text-xs font-bold uppercase tracking-widest text-green-700 block mb-1">Final Answer</span>
            <p className="text-lg font-black text-green-900">{answer}</p>
          </div>
        )}

        {(!showAnswer) && (
          <button
            onClick={handleNextStep}
            className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:translate-x-1 transition-transform"
          >
            {visibleStepCount < steps.length ? `Show Step ${visibleStepCount + 1}` : "Show Answer"}
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
