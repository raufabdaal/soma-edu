"use client";

import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, increment, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function useStudentProgress() {
  const { user } = useAuth();

  const trackLessonProgress = async (
    lessonId: string,
    topicId: string,
    subjectId: string,
    score: number,
    answers: unknown[],
    timeSpentSeconds: number
  ) => {
    if (!user) return;

    try {
      // 1. Write activity directly to progress collection so parent activity listener picks it up
      const lessonProgressRef = doc(db, "students", user.uid, "progress", lessonId);

      await setDoc(lessonProgressRef, {
        lessonId,
        completed: true,
        score,
        attempts: increment(1),
        completedAt: Timestamp.now(),
        timeSpentSeconds,
        answers
      }, { merge: true });

      // 2. Write to topic summary progress
      const topicProgressRef = doc(db, "students", user.uid, "progress", "topics", "summary", topicId);
      await setDoc(topicProgressRef, {
        topicId,
        lastStudiedAt: Timestamp.now(),
        lessonsCompleted: increment(1),
      }, { merge: true });

      // 3. Write directly to progress_subjects so StudentDashboard picks it up
      const subjectProgressRef = doc(db, "students", user.uid, "progress_subjects", subjectId);
      await setDoc(subjectProgressRef, {
        guaranteeProgress: increment(15), // Increase guarantee progress per lesson
        predictedGrade: score >= 80 ? "A" : score >= 60 ? "B" : "C",
        lastStudiedAt: Timestamp.now(),
      }, { merge: true });

    } catch (error) {
      console.error("Error tracking progress:", error);
    }
  };

  return { trackLessonProgress };
}
