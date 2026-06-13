"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const [studentData, setStudentData] = useState<Record<string, any> | null>(null);
  const [subjects, setSubjects] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch student profile
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          setStudentData(studentSnap.data());
        }

        // Fetch enrolled subjects
        // In Phase 1, we'll use mock subjects if none are enrolled
        const subjectsData = [
          { id: 'math_s3', name: 'Mathematics', code: 'S3', progress: 65, grade: 'B', color: '#2563EB' },
          { id: 'biology_s3', name: 'Biology', code: 'S3', progress: 42, grade: 'C', color: '#16A34A' },
          { id: 'chemistry_s3', name: 'Chemistry', code: 'S3', progress: 12, grade: 'D', color: '#7C3AED' },
        ];

        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Loading your dashboard...</div>;
  }

  const studentName = userProfile?.displayName?.split(" ")[0] || "Student";
  const overallGrade = "B"; // Simplified for MVP
  const guaranteeProgress = studentData?.guaranteeProgress || 45;

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      {/* Top Section: Greeting & Goal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Hello, {studentName}! 👋</h1>
          <p className="text-muted-foreground font-medium">Ready to reach your 80% goal today?</p>
        </div>
        <div className="bg-card border p-4 rounded-2xl flex items-center gap-4 shadow-sm min-w-[240px]">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center text-primary font-bold">
            2/5
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daily Goal</p>
            <p className="font-bold text-sm">2 of 5 lessons done</p>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Predicted Grade Tracker */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Predicted Grade</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-primary">{overallGrade}</span>
              <span className="text-green-500 font-bold flex items-center text-sm">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                Up from C
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Based on your last 14 days of activity and diagnostic results.
          </p>
        </div>

        {/* Guarantee Progress Bar */}
        <div className="md:col-span-2 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg shadow-primary/20 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Pass Guarantee</h3>
              <p className="text-2xl font-bold">You&apos;re {guaranteeProgress}% of the way there</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${guaranteeProgress}%` }}
              ></div>
            </div>
            <p className="text-xs font-medium opacity-90">
              Reach 80% to activate your &quot;Score 80 or Refund&quot; guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <h2 className="text-xl font-bold mb-6">Your Subjects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="h-2" style={{ backgroundColor: subject.color }}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{subject.code} Curriculum</p>
                </div>
                <span className="text-2xl font-black" style={{ color: subject.color }}>{subject.grade}</span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wider text-muted-foreground">
                  <span>Syllabus Covered</span>
                  <span>{subject.progress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                  ></div>
                </div>
              </div>

              <Link
                href={`/student/learn/${subject.id}`}
                className="flex items-center justify-center w-full py-3 rounded-xl font-bold border-2 transition-all hover:bg-muted group-active:scale-[0.98]"
                style={{ borderColor: subject.color, color: subject.color }}
              >
                Continue Studying
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <Link
          href="/student/practice"
          className="flex-1 bg-card border-2 border-dashed rounded-2xl p-6 flex items-center gap-4 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Past Paper Practice</p>
            <p className="text-sm text-muted-foreground">Test yourself with real UNEB questions.</p>
          </div>
        </Link>

        <Link
          href="/student/tutor"
          className="flex-1 bg-card border-2 border-dashed rounded-2xl p-6 flex items-center gap-4 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">AI Study Tutor</p>
            <p className="text-sm text-muted-foreground">Ask anything about your subjects.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
