import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { WeeklyReport, Student } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // Validate Cron Secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentsQuery = query(
      collection(db, "students"),
      where("subscriptionStatus", "in", ["active", "trial"])
    );
    const studentsSnap = await getDocs(studentsQuery);

    const results = [];

    for (const studentDoc of studentsSnap.docs) {
      const studentId = studentDoc.id;
      const studentData = studentDoc.data() as Student;

      // Calculate week range (Last 7 days)
      const now = new Date();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekId = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
      const reportId = `${studentId}_${weekId}`;

      // 1. Count completed lessons this week
      const lessonsQuery = query(
        collection(db, "students", studentId, "progress"),
        where("completedAt", ">=", Timestamp.fromDate(weekStart))
      );
      const lessonsSnap = await getDocs(lessonsQuery);
      const lessonsCompletedCount = lessonsSnap.size;

      // 2. Count past paper submissions this week
      const questionsQuery = query(
        collection(db, "students", studentId, "progress", "questions", "submissions"),
        where("timestamp", ">=", Timestamp.fromDate(weekStart))
      );
      const questionsSnap = await getDocs(questionsQuery);
      const questionsAttemptedCount = questionsSnap.size;

      // Aggregate Weekly Progress
      const report: WeeklyReport = {
        id: reportId,
        studentId,
        weekId,
        weekStart: Timestamp.fromDate(weekStart),
        weekEnd: Timestamp.fromDate(now),
        totalStudyMinutes: lessonsCompletedCount * 15, // Estimate 15 mins per lesson
        lessonsCompleted: lessonsCompletedCount,
        questionsAttempted: questionsAttemptedCount,
        subjectBreakdown: {},
        weakAreas: [],
        guaranteeProgress: studentData.diagnosticCompleted ? 67 : 0, // Placeholder calculation logic
        generatedAt: Timestamp.now(),
        deliveredEmail: false,
        deliveredWhatsapp: false
      };

      // Map subject grades from the student document
      Object.entries(studentData.predictedGrades || {}).forEach(([sub, grade]) => {
        report.subjectBreakdown[sub] = {
          studyMinutes: 0, // Would require deeper subcollection queries
          lessonsCompleted: 0,
          predictedGrade: grade,
          gradeChange: 0
        };
      });

      // Identify weak areas (Simplified: topics scoring below 50% in diagnostic)
      Object.entries(studentData.diagnosticScores || {}).forEach(([topic, score]) => {
        if (score < 50) report.weakAreas.push(topic);
      });

      // Save Report to Firestore
      await setDoc(doc(db, "weeklyReports", reportId), report);

      // Trigger Email via Resend
      if (process.env.RESEND_API_KEY) {
        console.log(`Report generated for student ${studentId}`);
        // Integration point for Resend SDK
      }

      results.push({ studentId, status: "success" });
    }

    return NextResponse.json({
      processed: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Weekly Report Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
