import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Resend } from "resend";
import { format, subDays } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");

export async function POST(req: NextRequest) {
  try {
    // 1. Validate cron secret header
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Query all active or trial students
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("subscriptionStatus", "in", ["active", "trial"]));
    const querySnapshot = await getDocs(q);

    const reports = [];
    const now = new Date();
    const weekAgo = subDays(now, 7);

    for (const studentDoc of querySnapshot.docs) {
      const studentId = studentDoc.id;
      const studentData = studentDoc.data();

      // 3. Attempt basic aggregation of the week's progress
      // In a full implementation, we'd query the subcollections for this specific student
      // For now, we'll try to fetch the subject summary which tracks study time
      const subjectSummaryRef = collection(db, "students", studentId, "progress", "subjects", "summary");
      const summarySnap = await getDocs(subjectSummaryRef);

      let totalStudySeconds = 0;
      summarySnap.forEach(doc => {
        const data = doc.data();
        // Use weeklyStudySeconds if it exists and was updated recently
        if (data.weeklyStudySeconds && data.lastStudiedAt?.toDate() > weekAgo) {
          totalStudySeconds += data.weeklyStudySeconds;
        }
      });

      const reportId = `${studentId}_${format(now, "yyyy-'W'ww")}`;

      const reportData = {
        id: reportId,
        studentId,
        weekId: format(now, "yyyy-'W'ww"),
        weekStart: Timestamp.fromDate(weekAgo),
        weekEnd: Timestamp.fromDate(now),
        totalStudyMinutes: Math.round(totalStudySeconds / 60),
        lessonsCompleted: 0, // Placeholder for further implementation
        questionsAttempted: 0, // Placeholder
        subjectBreakdown: {},
        weakAreas: [],
        guaranteeProgress: studentData.guaranteeProgress || 0,
        generatedAt: Timestamp.now(),
        deliveredEmail: false,
        deliveredWhatsapp: false,
      };

      // 4. Write WeeklyReport document to Firestore
      await setDoc(doc(db, "weeklyReports", reportId), reportData);

      // 5. Send email via Resend to each linked parent
      if (studentData.parentIds && studentData.parentIds.length > 0) {
        for (const parentId of studentData.parentIds) {
          const parentSnap = await getDoc(doc(db, "users", parentId));
          if (parentSnap.exists()) {
            const parentEmail = parentSnap.data().email;

            await resend.emails.send({
              from: 'SomaEdu <reports@somaedu.ug>',
              to: parentEmail,
              subject: `Weekly Progress Report: ${studentData.displayName || 'Your Child'}`,
              html: `
                <h1>Weekly Progress Report</h1>
                <p>Hello, here is the progress for ${studentData.displayName || 'your child'} this week.</p>
                <p><strong>Total Study Time:</strong> ${reportData.totalStudyMinutes} minutes</p>
                <p><strong>Guarantee Progress:</strong> ${reportData.guaranteeProgress}%</p>
                <p>Log in to your dashboard for the full breakdown.</p>
              `,
            });
          }
        }

        // Mark delivered
        await setDoc(doc(db, "weeklyReports", reportId), { deliveredEmail: true }, { merge: true });
      }

      reports.push(reportId);
    }

    return NextResponse.json({ success: true, reportsGenerated: reports.length });
  } catch (error: unknown) {
    console.error("Report Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
