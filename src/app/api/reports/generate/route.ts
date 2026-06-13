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

      // Aggregate Weekly Progress (Simplified for MVP)
      // In a full implementation, we'd query progress subcollections for the timestamp range
      const report: WeeklyReport = {
        id: reportId,
        studentId,
        weekId,
        weekStart: Timestamp.fromDate(weekStart),
        weekEnd: Timestamp.fromDate(now),
        totalStudyMinutes: 120, // Placeholder
        lessonsCompleted: 5,   // Placeholder
        questionsAttempted: 15, // Placeholder
        subjectBreakdown: {},
        weakAreas: ["Organic Chemistry"], // Placeholder
        guaranteeProgress: 67, // Placeholder
        generatedAt: Timestamp.now(),
        deliveredEmail: false,
        deliveredWhatsapp: false
      };

      // Map subject grades
      Object.entries(studentData.predictedGrades || {}).forEach(([sub, grade]) => {
        report.subjectBreakdown[sub] = {
          studyMinutes: 40,
          lessonsCompleted: 2,
          predictedGrade: grade,
          gradeChange: 0
        };
      });

      // Save Report to Firestore
      await setDoc(doc(db, "weeklyReports", reportId), report);

      // Trigger Email via Resend (Placeholder logic)
      if (process.env.RESEND_API_KEY) {
        // fetch('https://api.resend.com/emails', { ... })
        console.log(`Report generated and email queued for student ${studentId}`);
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
