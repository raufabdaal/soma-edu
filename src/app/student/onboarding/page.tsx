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
  ...Array.from({ length: 18 }).map((_, i) => ({
    id: `q${i + 3}`,
    text: `Diagnostic Question ${i + 3} for testing adaptive logic. Select option A.`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctIndex: 0,
    topic: "General Science",
    difficulty: (i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard") as any,
  }))
];

export default function DiagnosticTest() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.diagnosticCompleted) {
      router.replace("/student/dashboard");
    }
  }, [userProfile, router]);

  const handleAnswer = (optionIndex: number) => {
    const question = MOCK_DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
    const newAnswers = { ...answers, [question.id]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestionIndex < MOCK_DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const finishTest = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let correctCount = 0;
      MOCK_DIAGNOSTIC_QUESTIONS.forEach((q) => {
        if (answers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / MOCK_DIAGNOSTIC_QUESTIONS.length) * 100);

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
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="max-w-md w-full bg-card border rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Diagnostic Complete!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for completing the diagnostic test. We&apos;ve analyzed your results and prepared your personalized study path.
          </p>
          <button
            onClick={finishTest}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving Results..." : "Go to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = MOCK_DIAGNOSTIC_QUESTIONS[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b p-4 bg-card">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="font-bold text-primary">Diagnostic Test</h2>
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {MOCK_DIAGNOSTIC_QUESTIONS.length}
          </span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <div className="w-full h-2 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / MOCK_DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              {currentQuestion.topic}
            </span>
            <h3 className="text-xl md:text-2xl font-semibold mb-8 leading-tight">
              {currentQuestion.text}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="flex items-center p-4 border rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="w-8 h-8 flex items-center justify-center border rounded-full mr-4 group-hover:border-primary group-hover:text-primary font-bold text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
