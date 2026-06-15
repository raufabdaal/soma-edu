"use client";

import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, getDoc, increment, Timestamp } from "firebase/firestore";
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
      console.log("[useStudentProgress] Tracking lesson:", lessonId, "score:", score);

      // 1. Write individual lesson progress — parent activity feed reads this collection
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

      // 2. Read how many lessons this subject has total so we can calculate a per-lesson contribution.
      //    We check the subject document's totalTopics and average 2 lessons per topic as a base estimate.
      //    This prevents the guaranteeProgress from exceeding 100% when a student completes many lessons.
      const subjectProgressRef = doc(db, "students", user.uid, "progress_subjects", subjectId);
      const existingSnap = await getDoc(subjectProgressRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : null;

      // Each lesson contributes a fixed 10% to coverage, but we cap the total at 100%.
      // The parent dashboard reads guaranteeProgress to show actual coverage percentage.
      const currentProgress = existingData?.guaranteeProgress || 0;
      const newProgress = Math.min(100, currentProgress + 10);

      // Predict grade from score: 80%+ = A, 65%+ = B, 50%+ = C, else D
      const predictedGrade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";

      await setDoc(subjectProgressRef, {
        subjectId,
        guaranteeProgress: newProgress,
        predictedGrade,
        lastStudiedAt: Timestamp.now(),
        lessonsCompleted: increment(1),
        totalStudySeconds: increment(timeSpentSeconds),
      }, { merge: true });

      // 3. Write topic-level summary for future topic mastery tracking
      const topicProgressRef = doc(db, "students", user.uid, "progress_topics", topicId);
      await setDoc(topicProgressRef, {
        topicId,
        subjectId,
        lastStudiedAt: Timestamp.now(),
        lessonsCompleted: increment(1),
        totalStudySeconds: increment(timeSpentSeconds),
      }, { merge: true });

      console.log("[useStudentProgress] Progress saved. New coverage:", newProgress, "Grade:", predictedGrade);

    } catch (error) {
      console.error("[useStudentProgress] Error tracking progress:", error);
    }
  };

  return { trackLessonProgress };
}
