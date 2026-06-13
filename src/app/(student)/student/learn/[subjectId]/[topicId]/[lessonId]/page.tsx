"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Lesson } from "@/types";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStudentProgress } from "@/hooks/useStudentProgress";

export default function LessonPage() {
  const { subjectId, topicId, lessonId } = useParams();
  const router = useRouter();
  const { trackLessonProgress } = useStudentProgress();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lSnap = await getDoc(doc(db, "lessons", lessonId as string));
        if (lSnap.exists()) {
          setLesson({ id: lSnap.id, ...lSnap.data() } as Lesson);
        } else {
          // MOCK LESSON for demo
          setLesson({
            id: lessonId as string,
            subjectId: subjectId as string,
            topicId: topicId as string,
            title: "Introduction to Photosynthesis",
            order: 1,
            estimatedMinutes: 15,
            passingScore: 70,
            isActive: true,
            blocks: [
              { type: 'text', heading: 'What is Photosynthesis?', content: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water.' },
              { type: 'key_point', title: 'The Equation', content: '6CO2 + 6H2O + light energy → C6H12O6 + 6O2' },
              { type: 'question', question: 'What is the primary source of energy for photosynthesis?', options: ['Soil', 'Water', 'Sunlight', 'Oxygen'], correctIndex: 2, explanation: 'Sunlight provides the light energy needed to drive the chemical reaction.' },
              { type: 'worked_example', problem: 'Calculate the ratio of CO2 to O2 in the photosynthesis equation.', steps: ['Identify the coefficients in the balanced equation.', 'CO2 coefficient is 6.', 'O2 coefficient is 6.', 'The ratio is 6:6, which simplifies to 1:1.'], answer: '1:1' }
            ]
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, subjectId, topicId]);

  const handleComplete = async (score: number, answers: unknown[]) => {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    await trackLessonProgress(
      lessonId as string,
      topicId as string,
      subjectId as string,
      score,
      answers,
      durationSeconds
    );
    router.push(`/student/dashboard?completed=${lessonId}`);
  };

  if (loading) return <div className="p-8 text-center animate-premium-fade">Loading lesson...</div>;
  if (!lesson) return <div className="p-8 text-center">Lesson not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8 pt-0">
        <Link
          href={`/student/learn/${subjectId}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Topic
        </Link>

        <LessonPlayer lesson={lesson} onComplete={handleComplete} />
      </div>
    </div>
  );
}
