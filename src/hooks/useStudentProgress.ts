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
    answers: any[],
    timeSpentSeconds: number
  ) => {
    if (!user) return;

    try {
      const lessonProgressRef = doc(db, "students", user.uid, "progress", "lessons", "completed", lessonId);

      await setDoc(lessonProgressRef, {
        lessonId,
        completed: true,
        score,
        attempts: increment(1),
        completedAt: Timestamp.now(),
        timeSpentSeconds,
        answers
      }, { merge: true });

      const topicProgressRef = doc(db, "students", user.uid, "progress", "topics", "summary", topicId);
      await setDoc(topicProgressRef, {
        topicId,
        lastStudiedAt: Timestamp.now(),
        lessonsCompleted: increment(1),
      }, { merge: true });

      const subjectProgressRef = doc(db, "students", user.uid, "progress", "subjects", "summary", subjectId);
      await setDoc(subjectProgressRef, {
        subjectId,
        totalStudySeconds: increment(timeSpentSeconds),
        weeklyStudySeconds: increment(timeSpentSeconds),
        lastStudiedAt: Timestamp.now(),
      }, { merge: true });

    } catch (error) {
      console.error("Error tracking progress:", error);
    }
  };

  return { trackLessonProgress };
}
