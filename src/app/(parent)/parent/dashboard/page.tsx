"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  onSnapshot,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from "firebase/firestore";
import { Student, User } from "@/types";

interface Activity {
  id: string;
  type: "Lesson" | "Practice" | "Tutor";
  title: string;
  time: string;
  color: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<(Student & { displayName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [studyCode, setStudyCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedChildId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);

  // Stores real subject-level progress for the selected student
  // Keyed by subjectId — e.g. { biology: { guaranteeProgress: 30, predictedGrade: 'B' } }
  const [subjectProgress, setSubjectProgress] = useState<Record<string, { guaranteeProgress: number; predictedGrade: string }>>({});

  // Effect 1: Listen to parent document for linked student ID array
  useEffect(() => {
    if (!user) return;

    console.log("[ParentDashboard] Setting up parent document listener");
    const parentRef = doc(db, "parents", user.uid);
    let synced = false;

    const unsubscribe = onSnapshot(
      parentRef,
      (parentSnap) => {
        try {
          if (parentSnap.exists()) {
            const ids = (parentSnap.data().studentIds || []) as string[];
            console.log("[ParentDashboard] Linked student IDs:", ids);
            // Prevent unnecessary re-renders with a value comparison
            setStudentIds((prev) =>
              JSON.stringify(prev) === JSON.stringify(ids) ? prev : ids
            );
          } else {
            console.log("[ParentDashboard] No parent document found");
            setStudentIds([]);
          }
        } catch (err) {
          console.error("[ParentDashboard] Error in snapshot processing:", err);
        } finally {
          synced = true;
          if (!parentSnap.exists() || (parentSnap.data().studentIds || []).length === 0) {
            setLoading(false);
          }
        }
      },
      (err) => {
        console.error("[ParentDashboard] Parent snapshot listener error:", err);
        setLoading(false);
      }
    );

    // Fallback: stop spinner if Firestore never responds
    const timer = setTimeout(() => {
      if (!synced) {
        console.warn("[ParentDashboard] Sync timeout reached");
        setLoading(false);
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [user]);

  // Effect 2: Fetch full student profiles when the ID array changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (studentIds.length === 0) {
        setLinkedStudents([]);
        return;
      }

      const students: (Student & { displayName?: string })[] = [];

      for (const id of studentIds) {
        try {
          const sSnap = await getDoc(doc(db, "students", id));
          const uSnap = await getDoc(doc(db, "users", id));

          if (sSnap.exists()) {
            const sData = sSnap.data() as Student;
            const uData = uSnap.exists() ? (uSnap.data() as User) : null;
            students.push({ ...sData, displayName: uData?.displayName });
          }
        } catch (fetchErr) {
          console.error(`[ParentDashboard] Error fetching student ${id}:`, fetchErr);
        }
      }

      setLinkedStudents(students);

      // Auto-select first child if none is currently selected
      setSelectedChildId((prev) => {
        if (!prev || !students.find((s) => s.userId === prev)) {
          return students.length > 0 ? students[0].userId : null;
        }
        return prev;
      });

      setLoading(false);
    };

    fetchStudents();
  }, [studentIds]);

  // Effect 3: Listen to activity feed for the selected student
  useEffect(() => {
    if (!selectedStudentId) {
      setActivities([]);
      return;
    }

    console.log("[ParentDashboard] Setting up activity listener for student:", selectedStudentId);
    const progressRef = collection(db, "students", selectedStudentId, "progress");
    const q = query(progressRef, orderBy("completedAt", "desc"), firestoreLimit(5));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        try {
          const fetchedActivities: Activity[] = snap.docs.map((docSnap) => {
            const data = docSnap.data();
            const date = data.completedAt?.toDate() || new Date();
            const timeAgo = Math.floor((new Date().getTime() - date.getTime()) / 60000);

            let timeStr = "Just now";
            if (timeAgo >= 1440) timeStr = `${Math.floor(timeAgo / 1440)} days ago`;
            else if (timeAgo >= 60) timeStr = `${Math.floor(timeAgo / 60)} hours ago`;
            else if (timeAgo > 0) timeStr = `${timeAgo} mins ago`;

            return {
              id: docSnap.id,
              type: "Lesson",
              title: `Finished: ${
                data.lessonId
                  ?.split("_")
                  .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ") || "Lesson"
              }`,
              time: timeStr,
              color: "bg-blue-500",
            };
          });
          setActivities(fetchedActivities);
        } catch (err) {
          console.error("[ParentDashboard] Activity feed sync error:", err);
        }
      },
      (err) => {
        console.error("[ParentDashboard] Activity feed listener error:", err);
      }
    );

    return () => unsubscribe();
  }, [selectedStudentId]);

  // Effect 4: Fetch real subject-level progress for the selected student
  // Reads from students/{id}/progress_subjects which is written by useStudentProgress hook
  useEffect(() => {
    if (!selectedStudentId) {
      setSubjectProgress({});
      return;
    }

    const fetchSubjectProgress = async () => {
      try {
        const subjectsSnap = await getDocs(
          collection(db, "students", selectedStudentId, "progress_subjects")
        );
        const progressMap: Record<string, { guaranteeProgress: number; predictedGrade: string }> = {};
        subjectsSnap.docs.forEach(d => {
          const data = d.data();
          progressMap[d.id] = {
            guaranteeProgress: data.guaranteeProgress || 0,
            predictedGrade: data.predictedGrade || "N/A",
          };
        });
        console.log("[ParentDashboard] Subject progress loaded:", progressMap);
        setSubjectProgress(progressMap);
      } catch (err) {
        console.error("[ParentDashboard] Error fetching subject progress:", err);
      }
    };

    fetchSubjectProgress();
  }, [selectedStudentId]);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyCode || !user) return;
    setLinking(true);
    setError(null);

    try {
      const cleanCode = studyCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const q = query(collection(db, "students"), where("studyCode", "==", cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid Study Code. Please check and try again.");
        setLinking(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentId = studentDoc.id;

      // Upsert the parent document with this student ID added
      await setDoc(
        doc(db, "parents", user.uid),
        { userId: user.uid, studentIds: arrayUnion(studentId) },
        { merge: true }
      );

      // Link the student document back to this parent
      await updateDoc(doc(db, "students", studentId), {
        parentIds: arrayUnion(user.uid),
      });

      setStudyCode("");
      setSelectedChildId(studentId);
    } catch (err) {
      console.error("[ParentDashboard] Linking error:", err);
      setError("An error occurred while linking the account. Please check your connection.");
    } finally {
      setLinking(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-b-violet-500/30 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
          Syncing Portal...
        </p>
      </div>
    );
  }

  const selectedStudent = linkedStudents.find((s) => s.userId === selectedStudentId);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-7xl animate-premium-slide">

        {/* ── Page Header ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/60">
              Overview Panel
            </span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-2">Parent Portal</h1>
            <p className="text-slate-500 font-medium mt-1">
              Real-time visibility into your child&apos;s academic journey.
            </p>
          </div>

          {linkedStudents.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-100/30">
              {linkedStudents.map((student) => (
                <button
                  key={student.userId}
                  onClick={() => setSelectedChildId(student.userId)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedStudentId === student.userId
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-100/50"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {student.displayName?.split(" ")[0] || "Student"}
                </button>
              ))}
              <button
                onClick={() => {
                  setStudyCode("");
                  setLinkedStudents([]);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-200/50 text-slate-400 transition-colors"
                title="Add Another Child"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ── No children linked yet → show link form ── */}
        {linkedStudents.length === 0 ? (
          <div className="max-w-[480px] mx-auto bg-white border border-slate-100 rounded-[32px] shadow-[0_20px_50px_rgba(79,70,229,0.04)] p-10 text-center">
            <div className="w-16 h-16 bg-indigo-600/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-950 mb-2">Link Your Child</h2>
            <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">
              Enter the unique 6-character Study Code from your child&apos;s dashboard to track their learning progress.
            </p>

            <form onSubmit={handleLinkStudent} className="space-y-6">
              <div className="space-y-2">
                <input
                  id="study-code"
                  value={studyCode}
                  onChange={(e) => setStudyCode(e.target.value)}
                  placeholder="ABC-123"
                  className="w-full h-16 rounded-2xl border border-slate-100 bg-slate-50/50 text-center font-mono text-2xl font-black tracking-widest focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-slate-800"
                  maxLength={7}
                />
                <label
                  htmlFor="study-code"
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Study Code
                </label>
              </div>
              {error && (
                <p className="text-sm font-bold text-red-600 bg-red-50 py-2.5 rounded-xl border border-red-100/50">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={linking || !studyCode}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {linking ? "Linking..." : "Link Student Account"}
              </button>
            </form>
          </div>
        ) : (
          /* ── Children linked → show dashboard ── */
          <div className="space-y-10">
            {selectedStudent && (
              <>
                {/* Top Stats Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Subject Grades */}
                  <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Subject Grades</h3>
                    <div className="space-y-4">
                      {Object.entries(selectedStudent.predictedGrades || { "No Subjects": "N/A" }).map(([subject, grade]) => (
                        <div key={subject} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                          <span className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
                            {subject.split("_")[0]}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-indigo-600">{grade}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">↑</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guarantee Progress — sourced from real Firestore progress_subjects data */}
                  <div className="lg:col-span-2 bg-slate-900 text-white rounded-[32px] p-8 shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/10 blur-[60px] pointer-events-none" />

                    {/* Compute overall guarantee as average across all tracked subjects */}
                    {(() => {
                      const progressValues = Object.values(subjectProgress).map(p => p.guaranteeProgress);
                      const avgProgress = progressValues.length > 0
                        ? Math.min(100, Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length))
                        : 0;
                      const remaining = Math.max(0, 80 - avgProgress);

                      return (
                        <>
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white/10 text-indigo-300 rounded-full border border-white/5">
                                Score Guarantee Target
                              </span>
                              <p className="text-3xl font-extrabold mt-4">
                                {progressValues.length > 0
                                  ? `Syllabus coverage is at ${avgProgress}%`
                                  : "No lessons completed yet"}
                              </p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                            </div>
                          </div>

                          <div className="space-y-4 relative z-10 mt-6">
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${avgProgress}%` }} />
                            </div>
                            <p className="text-xs font-medium text-slate-300">
                              {remaining > 0
                                ? `${selectedStudent?.displayName?.split(" ")[0]} needs ${remaining}% more coverage to unlock the refund policy guarantee.`
                                : `${selectedStudent?.displayName?.split(" ")[0]} has met the 80% guarantee threshold!`}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Action Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Needs Focus — real low-scoring subjects derived from progress data */}
                  <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.01)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/5 text-orange-600 flex items-center justify-center border border-orange-500/10">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-black text-slate-800">Needs Focus</h3>
                    </div>

                    <div className="space-y-4">
                      {Object.keys(subjectProgress).length > 0 ? (
                        Object.entries(subjectProgress)
                          // Sort by lowest guarantee progress first — these need the most attention
                          .sort(([, a], [, b]) => a.guaranteeProgress - b.guaranteeProgress)
                          .slice(0, 3)
                          .map(([subjectId, progress]) => (
                            <div key={subjectId} className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100/50 transition-all duration-200">
                              <div>
                                <p className="font-extrabold text-sm text-slate-800 capitalize">{subjectId}</p>
                                <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5">Predicted: {progress.predictedGrade}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-orange-600 font-black text-base">{Math.min(100, progress.guaranteeProgress)}%</span>
                                <span className="text-[8px] font-bold uppercase text-slate-400 block">Coverage</span>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-slate-400 italic">No lesson data yet. Encourage your child to complete their first lesson.</p>
                      )}
                    </div>
                  </div>

                  {/* Weekly Activity */}
                  <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.01)]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-black text-slate-800">Weekly Activity</h3>
                      <button className="text-[10px] font-bold text-indigo-600 hover:underline">Full Report</button>
                    </div>
                    <div className="space-y-5">
                      {activities.length > 0 ? (
                        activities.map((act, i) => (
                          <div key={act.id} className="flex gap-4 items-start relative pb-4 last:pb-0">
                            {i < activities.length - 1 && (
                              <div className="absolute left-[7px] top-4 bottom-0 w-[2px] bg-slate-100" />
                            )}
                            <div className={`w-3.5 h-3.5 rounded-full mt-1 z-10 border-2 border-white ${act.color}`} />
                            <div>
                              <p className="text-sm font-extrabold text-slate-800 leading-tight">{act.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{act.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic">No recent activity recorded.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
