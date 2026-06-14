"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from "firebase/firestore";
import { Student, User } from "@/types";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<(Student & { displayName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [studyCode, setStudyCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkedStudents = async () => {
      if (!user) return;
      try {
        const parentRef = doc(db, "parents", user.uid);
        const parentSnap = await getDoc(parentRef);

        if (parentSnap.exists()) {
          const studentIds = parentSnap.data().studentIds || [];
          const students: (Student & { displayName?: string })[] = [];

          for (const id of studentIds) {
            const sSnap = await getDoc(doc(db, "students", id));
            const uSnap = await getDoc(doc(db, "users", id));

            if (sSnap.exists()) {
              const sData = sSnap.data() as Student;
              const uData = uSnap.exists() ? uSnap.data() as User : null;
              students.push({ ...sData, displayName: uData?.displayName });
            }
          }
          setLinkedStudents(students);
          if (students.length > 0 && !selectedStudentId) {
            setSelectedChildId(students[0].userId);
          }
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedStudents();
  }, [user, selectedStudentId]);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyCode || !user) return;
    setLinking(true);
    setError(null);

    try {
      const q = query(collection(db, "students"), where("studyCode", "==", studyCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid Study Code. Please check and try again.");
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentId = studentDoc.id;

      // Update Parent document
      await updateDoc(doc(db, "parents", user.uid), {
        studentIds: arrayUnion(studentId)
      });

      // Update Student document
      await updateDoc(doc(db, "students", studentId), {
        parentIds: arrayUnion(user.uid)
      });

      setStudyCode("");
      setSelectedChildId(studentId);
    } catch (err) {
      console.error("Linking error:", err);
      setError("An error occurred while linking the account.");
    } finally {
      setLinking(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-premium-fade">Loading parent portal...</div>;

  const selectedStudent = linkedStudents.find(s => s.userId === selectedStudentId);

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Parent Dashboard</h1>
          <p className="text-muted-foreground font-medium">Monitoring academic progress for your children.</p>
        </div>

        {linkedStudents.length > 0 && (
          <div className="flex items-center gap-3 bg-card border p-1.5 rounded-2xl shadow-sm">
            {linkedStudents.map(student => (
              <button
                key={student.userId}
                onClick={() => setSelectedChildId(student.userId)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedStudentId === student.userId
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {student.displayName?.split(' ')[0] || "Student"}
              </button>
            ))}
            <button
              onClick={() => { setStudyCode(""); setLinkedStudents([]); }} // Reset to show link UI
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {linkedStudents.length === 0 ? (
        <div className="max-w-md mx-auto bg-card border rounded-3xl p-10 shadow-xl text-center">
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
                className="w-full px-4 py-5 rounded-2xl border-2 text-center font-mono text-2xl font-black tracking-widest focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                maxLength={7}
              />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">6-Character Study Code</p>
            </div>
            {error && <p className="text-sm font-bold text-destructive bg-destructive/10 py-2 rounded-lg">{error}</p>}
            <button
              disabled={linking || !studyCode}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50"
            >
              {linking ? "Linking..." : "Link Student Account"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-10">
          {selectedStudent && (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Subject Grades */}
                 <div className="bg-card border rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-8">Current Grades</h3>
                  <div className="space-y-6">
                    {Object.entries(selectedStudent.predictedGrades || { "No Subjects": "N/A" }).map(([subject, grade]) => (
                      <div key={subject} className="flex justify-between items-center">
                        <span className="font-bold text-sm text-foreground">{subject.split('_')[0].toUpperCase()}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-primary">{grade}</span>
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-black">↑</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guarantee Progress */}
                <div className="md:col-span-2 bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl shadow-primary/20 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">80% Result Guarantee</h3>
                      <p className="text-4xl font-black italic">67% Complete</p>
                    </div>
                    <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-md">
                      <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: "67%" }}></div>
                    </div>
                    <p className="text-sm font-bold opacity-90 leading-relaxed">
                      {selectedStudent.displayName?.split(' ')[0]} has completed 67% of the required study plan to activate the grade guarantee.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Needs Attention */}
                <div className="bg-card border rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-black italic">Needs Attention</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { topic: "Organic Chemistry", subject: "Chemistry", score: "34%" },
                      { topic: "Calculus Basics", subject: "Mathematics", score: "42%" }
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-muted/40 rounded-2xl flex justify-between items-center border border-transparent hover:border-orange-200 transition-colors">
                        <div>
                          <p className="font-bold text-sm">{item.topic}</p>
                          <p className="text-[10px] font-black uppercase text-muted-foreground">{item.subject}</p>
                        </div>
                        <span className="text-orange-600 font-black">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card border rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-black italic mb-8">Weekly Activity</h3>
                  <div className="space-y-6">
                    {[
                      { type: "Lesson", title: "Finished: Acids & Bases", time: "2 hours ago", color: "text-blue-500" },
                      { type: "Practice", title: "Attempted: Biology 2023 Paper", time: "Yesterday", color: "text-green-500" },
                      { type: "Tutor", title: "Asked 4 questions in AI Tutor", time: "2 days ago", color: "text-violet-500" }
                    ].map((act, i) => (
                      <div key={i} className={`flex gap-4 items-start `}>
                        <div className={`w-2 h-2 rounded-full mt-2 ${act.color.replace('text', 'bg')}`}></div>
                        <div>
                          <p className="text-sm font-bold">{act.title}</p>
                          <p className="text-xs text-muted-foreground">{act.time}</p>
                        </div>
                      </div>
                    ))}
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
