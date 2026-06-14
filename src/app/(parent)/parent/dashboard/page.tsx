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
  getDocs
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

  // 1. Listen to Parent Profile & Linked Students
  useEffect(() => {
    if (!user) return;

    console.log("[ParentDashboard] Setting up parent document listener");
    const parentRef = doc(db, "parents", user.uid);

    let synced = false;

    const unsubscribe = onSnapshot(parentRef, async (parentSnap) => {
      try {
        if (parentSnap.exists()) {
          const studentIds = (parentSnap.data().studentIds || []) as string[];
          console.log("[ParentDashboard] Linked student IDs:", studentIds);

          const students: (Student & { displayName?: string })[] = [];

          if (studentIds.length > 0) {
            for (const id of studentIds) {
              try {
                const sSnap = await getDoc(doc(db, "students", id));
                const uSnap = await getDoc(doc(db, "users", id));

                if (sSnap.exists()) {
                  const sData = sSnap.data() as Student;
                  const uData = uSnap.exists() ? uSnap.data() as User : null;
                  students.push({ ...sData, displayName: uData?.displayName });
                }
              } catch (fetchErr) {
                console.error(`[ParentDashboard] Error fetching student ${id}:`, fetchErr);
              }
            }
          }

          setLinkedStudents(students);

          // Auto-select first child if none selected or if selected is not in the list
          if (students.length > 0) {
            setSelectedChildId(prev => {
              if (!prev || !students.find(s => s.userId === prev)) {
                return students[0].userId;
              }
              return prev;
            });
          }
        } else {
          console.log("[ParentDashboard] No parent document found");
          setLinkedStudents([]);
        }
      } catch (err) {
        console.error("[ParentDashboard] Error in snapshot processing:", err);
      } finally {
        setLoading(false);
        synced = true;
      }
    }, (err) => {
      console.error("[ParentDashboard] Parent snapshot listener error:", err);
      setLoading(false);
    });

    // Emergency fallback to stop the syncing spinner
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
  }, [user?.uid]);

  // 2. Listen to Activity Feed for Selected Student
  useEffect(() => {
    if (!selectedStudentId) {
      setActivities([]);
      return;
    }

    console.log("[ParentDashboard] Setting up activity listener for student:", selectedStudentId);
    const progressRef = collection(db, "students", selectedStudentId, "progress");
    const q = query(progressRef, orderBy("completedAt", "desc"), firestoreLimit(5));

    const unsubscribe = onSnapshot(q, (snap) => {
      try {
        const fetchedActivities: Activity[] = snap.docs.map(doc => {
          const data = doc.data();
          const date = data.completedAt?.toDate() || new Date();
          const timeAgo = Math.floor((new Date().getTime() - date.getTime()) / 60000);

          let timeStr = "Just now";
          if (timeAgo >= 1440) timeStr = `${Math.floor(timeAgo/1440)} days ago`;
          else if (timeAgo >= 60) timeStr = `${Math.floor(timeAgo/60)} hours ago`;
          else if (timeAgo > 0) timeStr = `${timeAgo} mins ago`;

          return {
            id: doc.id,
            type: "Lesson",
            title: `Finished: ${data.lessonId?.split('_').map((w:string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "Lesson"}`,
            time: timeStr,
            color: "bg-blue-500"
          };
        });
        setActivities(fetchedActivities);
      } catch (err) {
        console.error("[ParentDashboard] Activity feed sync error:", err);
      }
    }, (err) => {
      console.error("[ParentDashboard] Activity feed listener error:", err);
    });

    return () => unsubscribe();
  }, [selectedStudentId]);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyCode || !user) return;
    setLinking(true);
    setError(null);

    try {
      const q = query(collection(db, "students"), where("studyCode", "==", studyCode.toUpperCase().trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid Study Code. Please check and try again.");
        setLinking(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentId = studentDoc.id;

      // Ensure Parent document exists and update it
      await setDoc(doc(db, "parents", user.uid), {
        userId: user.uid,
        studentIds: arrayUnion(studentId)
      }, { merge: true });

      // Update Student document with parent link
      await updateDoc(doc(db, "students", studentId), {
        parentIds: arrayUnion(user.uid)
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

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Portal...</p>
    </div>
  );

  const selectedStudent = linkedStudents.find(s => s.userId === selectedStudentId);

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      {/* Premium Header */}
      <div className="welcome-banner mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter mb-2">Parent Portal</h1>
            <p className="opacity-80 font-medium">Real-time visibility into your child&apos;s academic journey.</p>
          </div>

          {linkedStudents.length > 0 && (
            <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
              {linkedStudents.map(student => (
                <button
                  key={student.userId}
                  onClick={() => setSelectedChildId(student.userId)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    selectedStudentId === student.userId
                      ? "bg-white text-primary shadow-lg"
                      : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  {student.displayName?.split(' ')[0] || "Student"}
                </button>
              ))}
              <button
                onClick={() => { setStudyCode(""); setLinkedStudents([]); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors text-white"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {linkedStudents.length === 0 ? (
        <div className="max-w-md mx-auto glass-panel p-10 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary rotate-3">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-3">Link Your Child</h2>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
            Enter the Study Code from your child&apos;s student dashboard to start tracking their progress.
          </p>

          <form onSubmit={handleLinkStudent} className="space-y-6">
            <div className="space-y-2">
              <input
                value={studyCode}
                onChange={(e) => setStudyCode(e.target.value)}
                placeholder="TRV-2A9"
                className="w-full px-4 py-5 rounded-2xl border-2 text-center font-mono text-2xl font-black tracking-widest focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-background text-foreground"
                maxLength={7}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">6-Character Study Code</p>
            </div>
            {error && <p className="text-sm font-bold text-destructive bg-destructive/10 py-2 rounded-lg">{error}</p>}
            <button
              type="submit"
              disabled={linking || !studyCode}
              className="btn btn-primary w-full py-4 text-lg uppercase tracking-tighter italic"
            >
              {linking ? "Linking..." : "Link Student Account"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {selectedStudent && (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Subject Grades */}
                 <div className="glass-panel flex flex-col justify-between">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-8">Current Grades</h3>
                  <div className="space-y-6">
                    {Object.entries(selectedStudent.predictedGrades || { "No Subjects": "N/A" }).map(([subject, grade]) => (
                      <div key={subject} className="flex justify-between items-center border-b border-muted pb-3 last:border-0">
                        <span className="font-bold text-sm text-foreground uppercase tracking-tight">{subject.split('_')[0]}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-primary italic">{grade}</span>
                          <span className={`dash-tag tag-success`}>↑</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guarantee Progress */}
                <div className="md:col-span-2 bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">80% Result Guarantee</h3>
                      <p className="text-5xl font-black italic tracking-tighter">67%</p>
                    </div>
                    <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                      <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: "67%" }}></div>
                    </div>
                    <p className="text-sm font-bold opacity-90 leading-relaxed max-w-md">
                      {selectedStudent.displayName?.split(' ')[0]} is on track! Complete 13% more tasks to activate the 80% score guarantee.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Needs Attention */}
                <div className="glass-panel border-l-4 border-l-orange-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Needs Attention</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { topic: "Organic Chemistry", subject: "Chemistry", score: "34%", trend: "down" },
                      { topic: "Calculus Basics", subject: "Mathematics", score: "42%", trend: "up" }
                    ].map((item, i) => (
                      <div key={i} className="p-5 bg-muted/30 rounded-2xl flex justify-between items-center border border-transparent hover:border-muted-foreground/10 transition-all group">
                        <div>
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.topic}</p>
                          <p className="text-[10px] font-black uppercase text-muted-foreground">{item.subject}</p>
                        </div>
                        <div className="text-right">
                           <span className="text-orange-600 font-black block text-lg">{item.score}</span>
                           <span className="text-[8px] font-black uppercase text-muted-foreground">Mastery Level</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Section */}
                <div className="glass-panel">
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Weekly Activity</h3>
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All Reports</button>
                  </div>
                  <div className="space-y-6">
                    {activities.length > 0 ? activities.map((act, i) => (
                      <div key={act.id} className="flex gap-6 items-start relative pb-6 last:pb-0">
                        {i < activities.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-[2px] bg-muted"></div>}
                        <div className={`w-4 h-4 rounded-full mt-1.5 z-10 border-4 border-background ${act.color}`}></div>
                        <div>
                          <p className="text-sm font-bold leading-none mb-1">{act.title}</p>
                          <p className="text-[10px] font-black uppercase text-muted-foreground">{act.time}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground italic">No recent activity recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
