"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

const MOCK_DIAGNOSTIC_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "What is the process by which plants make their own food?",
    options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"],
    correctIndex: 1,
    topic: "Biology - Plant Nutrition",
    difficulty: "easy",
  },
  {
    id: "q2",
    text: "Solve for x: 2x + 5 = 15",
    options: ["x = 5", "x = 10", "x = 7.5", "x = 20"],
    correctIndex: 0,
    topic: "Mathematics - Algebra",
    difficulty: "easy",
  },
  ...Array.from({ length: 38 }).map((_, i) => {
    const topics = ["Biology - Cells", "Chemistry - Acids", "Mathematics - Geometry", "Physics - Force"];
    const topic = topics[i % topics.length];
    const difficulty = (i < 10 ? "easy" : i < 25 ? "medium" : "hard") as "easy" | "medium" | "hard";
    return {
      id: `q${i + 3}`,
      text: `${difficulty.toUpperCase()} Question on ${topic} (${i + 3}). Select option A.`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      topic,
      difficulty,
    };
  })
];

const TOTAL_QUESTIONS_TO_ANSWER = 20;

export default function DiagnosticTest() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState<Question>(MOCK_DIAGNOSTIC_QUESTIONS[0]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.diagnosticCompleted) {
      router.replace("/student/dashboard");
    }
  }, [userProfile, router]);

  const handleAnswer = (optionIndex: number) => {
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    const newAnswers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(newAnswers);

    const nextQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(nextQuestionsAnswered);

    if (nextQuestionsAnswered >= TOTAL_QUESTIONS_TO_ANSWER) {
      setIsCompleted(true);
      return;
    }

    // Adaptive logic:
    // If correct, find a harder question. If incorrect, find an easier one.
    const currentDifficulty = currentQuestion.difficulty;
    let targetDifficulty: "easy" | "medium" | "hard" = currentDifficulty;

    if (isCorrect) {
      if (currentDifficulty === "easy") targetDifficulty = "medium";
      else if (currentDifficulty === "medium") targetDifficulty = "hard";
    } else {
      if (currentDifficulty === "hard") targetDifficulty = "medium";
      else if (currentDifficulty === "medium") targetDifficulty = "easy";
    }

    const answeredIds = Object.keys(newAnswers);
    const availableQuestions = MOCK_DIAGNOSTIC_QUESTIONS.filter(q => !answeredIds.includes(q.id));

    let nextQ = availableQuestions.find(q => q.difficulty === targetDifficulty);
    if (!nextQ) {
      // Fallback if no question of target difficulty is available
      nextQ = availableQuestions[0];
    }

    if (nextQ) {
      setCurrentQuestion(nextQ);
    } else {
      setIsCompleted(true);
    }
  };

  const finishTest = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let score = 0;
      const answeredQuestions = MOCK_DIAGNOSTIC_QUESTIONS.filter(q => Object.keys(answers).includes(q.id));

      let correctCount = 0;
      answeredQuestions.forEach((q) => {
        if (answers[q.id] === q.correctIndex) {
          // Weight score by difficulty
          const weight = q.difficulty === "hard" ? 3 : q.difficulty === "medium" ? 2 : 1;
          correctCount += weight;
        }
      });

      const maxPossible = answeredQuestions.reduce((acc, q) => {
        const weight = q.difficulty === "hard" ? 3 : q.difficulty === "medium" ? 2 : 1;
        return acc + weight;
      }, 0);

      score = Math.round((correctCount / maxPossible) * 100);

      await updateDoc(doc(db, "students", user.uid), {
        diagnosticCompleted: true,
        diagnosticScores: { overall: score },
        predictedGrades: { overall: score > 80 ? "A" : score > 70 ? "B" : score > 60 ? "C" : "D" }
      });

      router.replace("/student/dashboard");
    } catch (error) {
      console.error("Error saving diagnostic results:", error);
      setSaving(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6 relative">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full bg-white border border-slate-100 rounded-[32px] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.025)] animate-premium-slide">
          <div className="w-20 h-20 bg-indigo-50 border border-indigo-100/30 rounded-3xl mx-auto flex items-center justify-center text-indigo-600 mb-8 animate-bounce">
            <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current stroke-[2] fill-none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Diagnostic Complete!</h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Thank you for completing the diagnostic test. We&apos;ve analyzed your responses and compiled your personalized O-Level study track.
          </p>
          <button
            onClick={finishTest}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 hover:shadow-[0_10px_25px_rgba(79,70,229,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Results...
              </>
            ) : (
              "Go to Dashboard"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col relative">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 p-4 px-6">
        <div className="container mx-auto max-w-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <span className="font-black text-slate-800 tracking-tight text-sm">SOMAEDU</span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full">
            Question {questionsAnswered + 1} of {TOTAL_QUESTIONS_TO_ANSWER}
          </span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl flex flex-col justify-center animate-premium-slide">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((questionsAnswered + 1) / TOTAL_QUESTIONS_TO_ANSWER) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question container */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.015)]">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-6 border border-indigo-100/60">
            {currentQuestion.topic}
          </span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-8 leading-snug">
            {currentQuestion.text}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="flex items-center p-4 border border-slate-100 rounded-2xl text-left bg-slate-50/20 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all duration-200 group active:scale-[0.99] hover:translate-x-1"
              >
                <span className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white rounded-xl mr-4 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 font-bold text-slate-700 text-sm shadow-sm transition-all">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
