import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Resend } from "resend";
import { format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");

export async function POST(req: NextRequest) {
  try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("subscriptionStatus", "in", ["active", "trial"]));
    const querySnapshot = await getDocs(q);

    const reports = [];

    for (const studentDoc of querySnapshot.docs) {
      const studentId = studentDoc.id;
      const studentData = studentDoc.data();
      const reportId = `${studentId}_${format(new Date(), "yyyy-'W'ww")}`;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const reportData = {
        id: reportId,
        studentId,
        weekId: format(new Date(), "yyyy-'W'ww"),
        weekStart: Timestamp.fromDate(weekStart),
        weekEnd: Timestamp.now(),
        totalStudyMinutes: 120,
        lessonsCompleted: 5,
        questionsAttempted: 24,
        subjectBreakdown: {
          biology_s3: { studyMinutes: 45, lessonsCompleted: 2, predictedGrade: 'B', gradeChange: 1 },
          math_s3: { studyMinutes: 75, lessonsCompleted: 3, predictedGrade: 'A', gradeChange: 0 },
        },
        weakAreas: ["Organic Chemistry", "Photosynthesis"],
        guaranteeProgress: studentData.guaranteeProgress || 45,
        generatedAt: Timestamp.now(),
        deliveredEmail: false,
        deliveredWhatsapp: false,
      };

      await setDoc(doc(db, "weeklyReports", reportId), reportData);

      if (studentData.parentIds && studentData.parentIds.length > 0) {
        for (const parentId of studentData.parentIds) {
          const parentSnap = await getDoc(doc(db, "users", parentId));
          if (parentSnap.exists()) {
            const parentEmail = parentSnap.data().email;
            await resend.emails.send({
              from: 'SomaEdu <reports@somaedu.ug>',
              to: parentEmail,
              subject: `Weekly Progress Report: ${studentData.displayName || 'Your Child'}`,
              html: `<h1>Weekly Progress Report</h1><p>Progress for ${studentData.displayName || 'your child'} this week.</p>`,
            });
          }
        }
        await setDoc(doc(db, "weeklyReports", reportId), { deliveredEmail: true }, { merge: true });
      }
      reports.push(reportId);
    }
    return NextResponse.json({ success: true, reportsGenerated: reports.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
