"use client";

import { useState } from "react";
import { SpeechButton } from "../ui/SpeechButton";

interface QuestionBlockProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function QuestionBlock({
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
  disabled
}: QuestionBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (submitted || disabled) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null || submitted || disabled) return;
    setSubmitted(true);
    onAnswer(selected === correctIndex);
  };

  const textToRead = `${question}. Options: ${options.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}`).join('. ')}. ${submitted ? `Explanation: ${explanation}` : ''}`;

  return (
    <div className="mb-8 p-6 bg-card border rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 group relative">
      <div className="flex justify-between items-start gap-4 mb-6">
        <h4 className="text-lg font-bold leading-tight">{question}</h4>
        <SpeechButton text={textToRead} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="space-y-3 mb-6">
        {options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === correctIndex;

          let variant = "default";
          if (submitted) {
            if (isCorrect) variant = "correct";
            else if (isSelected) variant = "incorrect";
          } else if (isSelected) {
            variant = "selected";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={submitted || disabled}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-3 ${
                variant === "correct" ? "bg-green-50 border-green-500 text-green-900" :
                variant === "incorrect" ? "bg-red-50 border-red-500 text-red-900" :
                variant === "selected" ? "bg-primary/5 border-primary text-primary" :
                "bg-background border-border hover:border-primary/50"
              }`}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full border shrink-0 text-xs font-bold ${
                variant === "correct" ? "bg-green-500 border-green-500 text-white" :
                variant === "incorrect" ? "bg-red-500 border-red-500 text-white" :
                variant === "selected" ? "bg-primary border-primary text-white" :
                "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="font-medium">{option}</span>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null || disabled}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          Submit Answer
        </button>
      )}

      {submitted && (
        <div className="p-4 bg-muted/50 rounded-xl animate-in zoom-in-95 duration-300">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Explanation</p>
          <p className="text-sm leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
