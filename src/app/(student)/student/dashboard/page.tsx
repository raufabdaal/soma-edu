"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { Student } from "@/types";

interface SubjectWithProgress {
  id: string;
  name: string;
  code: string;
  progress: number;
  grade: string;
  color: string;
}

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<SubjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch student profile
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);
        let studentProfileData = null;
        if (studentSnap.exists()) {
          studentProfileData = studentSnap.data() as Student;
          setStudentData(studentProfileData);
        }

        // Fetch enrolled subjects metadata
        const enrolledIds = studentProfileData?.enrolledSubjects || ['mathematics', 'biology', 'chemistry'];

        const subjectsData = await Promise.all(enrolledIds.map(async (id: string) => {
          const subjectRef = doc(db, "subjects", id);
          const subjectSnap = await getDoc(subjectRef);

          let subjectInfo = {
            id,
            name: id.split('_')[0].charAt(0).toUpperCase() + id.split('_')[0].slice(1),
            code: id.split('_')[1].toUpperCase(),
            color: id.includes('math') ? '#2563EB' : id.includes('bio') ? '#16A34A' : '#7C3AED'
          };

          if (subjectSnap.exists()) {
            const data = subjectSnap.data();
            subjectInfo = { ...subjectInfo, name: data.name, code: data.level, color: data.accentColor };
          }

          // Fetch progress for this subject
          const progressRef = doc(db, "students", user.uid, "progress_subjects", id);
          const progressSnap = await getDoc(progressRef);

          let progressData = { progress: 0, grade: studentProfileData?.predictedGrades?.[id] || 'N/A' };
          if (progressSnap.exists()) {
            const data = progressSnap.data();
            progressData = {
              progress: data.guaranteeProgress || 0,
              grade: data.predictedGrade || 'N/A'
            };
          }

          return { ...subjectInfo, ...progressData };
        }));

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

  // Derive real aggregate metrics from fetched Firestore subject progress data.
  // We average the grade letters to get an overall grade, and cap guarantee at 100.
  const gradeLetters = subjects.map(s => s.grade).filter(g => g && g !== "N/A");
  const gradeOrder = ["A", "B", "C", "D", "E"];
  const avgGradeIndex = gradeLetters.length > 0
    ? Math.round(gradeLetters.reduce((sum, g) => sum + (gradeOrder.indexOf(g) >= 0 ? gradeOrder.indexOf(g) : 2), 0) / gradeLetters.length)
    : 2;
  const overallGrade = gradeOrder[Math.min(avgGradeIndex, gradeOrder.length - 1)];

  // guaranteeProgress is the average across all subject progress docs, capped at 100
  const allProgress = subjects.map(s => s.progress).filter(p => typeof p === "number");
  const guaranteeProgress = allProgress.length > 0
    ? Math.min(100, Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Decorative top blurred background glow */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-7xl animate-premium-slide">
        {/* Top Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/60">
                Student Profile
              </span>
              {studentData?.studyCode && (
                <div className="flex items-center gap-1.5 pl-3 pr-1 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200/40 text-[10px] font-black uppercase tracking-widest">
                  <span className="opacity-60">Code:</span>
                  <span className="text-slate-800 font-bold mr-1">{studentData.studyCode}</span>
                  <button
                    onClick={() => handleCopyCode(studentData.studyCode)}
                    className="p-1 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    aria-label={copied ? "Study code copied" : "Copy study code"}
                  >
                    {copied ? (
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none" className="text-emerald-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Hello, {studentName}! 👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Here is your learning summary. Ready to reach your 80% goal today?
            </p>
          </div>

          {/* Daily Goal Status Banner */}
          <div className="bg-white border border-slate-100 p-5 rounded-[24px] flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)] min-w-[280px]">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-600" strokeDasharray="40, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="text-xs font-black text-slate-800">2/5</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Daily Study Goal</p>
              <p className="font-extrabold text-sm text-slate-800">2 of 5 lessons completed</p>
            </div>
          </div>
        </div>

        {/* Highlight Stats Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Predicted Grade Tracker Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[120px] transition-colors group-hover:bg-indigo-50/50" />
            <div className="relative">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Predicted overall Grade</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black text-indigo-600 tracking-tighter">{overallGrade}</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-xl text-xs flex items-center gap-1 border border-emerald-100/50">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  Up from C
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-8 leading-relaxed">
              Based on your ongoing practice exams, lesson quizzes, and diagnostic history.
            </p>
          </div>

          {/* Refund pass guarantee Card */}
          <div className="lg:col-span-2 bg-slate-900 text-white rounded-[32px] p-8 shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden group">
            {/* Visual gradient orb */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/10 blur-[60px] pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white/10 text-indigo-300 rounded-full border border-white/5">
                  Secure Score Guarantee
                </span>
                <p className="text-3xl font-extrabold tracking-tight mt-4 text-white">Your goal is {guaranteeProgress}% complete</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4 relative z-10 mt-6">
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${guaranteeProgress}%` }}
                ></div>
              </div>
              <p className="text-xs font-medium text-slate-300">
                Maintain 80% syllabus progress to unlock the score guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Subjects List section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Subject Portals</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
              {subjects.length} active courses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.03)] transition-all duration-300 hover:translate-y-[-4px] group flex flex-col justify-between">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {subject.code} Level
                      </span>
                      <h3 className="font-black text-2xl text-slate-800 mt-1">{subject.name}</h3>
                    </div>
                    <span className="text-3xl font-black" style={{ color: subject.color }}>
                      {subject.grade}
                    </span>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider text-slate-400">
                      <span>Syllabus Covered</span>
                      <span className="text-slate-700">{subject.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <Link
                    href={`/student/learn/${subject.id}`}
                    className="flex items-center justify-center w-full h-12 rounded-2xl font-bold border-2 transition-all hover:bg-slate-50 group-active:scale-[0.98]"
                    style={{ borderColor: subject.color, color: subject.color }}
                  >
                    Continue Studying
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lower layout widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/student/practice"
            className="group relative bg-white border border-slate-100 rounded-[32px] p-8 flex items-center gap-6 shadow-[0_15px_30px_rgba(0,0,0,0.01)] hover:border-slate-200 transition-all hover:translate-y-[-2px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-500/5 text-orange-600 flex items-center justify-center shrink-0 border border-orange-500/10">
              <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-lg">Past Paper Prep & Quizzes</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">Challenge yourself using authentic national UNEB revision items.</p>
            </div>
          </Link>

          <Link
            href="/student/tutor"
            className="group relative bg-white border border-slate-100 rounded-[32px] p-8 flex items-center gap-6 shadow-[0_15px_30px_rgba(0,0,0,0.01)] hover:border-slate-200 transition-all hover:translate-y-[-2px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-500/10">
              <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-lg">Ask our AI Study Buddy</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">Unblock complex concepts with automated step-by-step solutions.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
