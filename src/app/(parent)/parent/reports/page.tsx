"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { WeeklyReport } from "@/types";

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      try {
        // First get linked student IDs
        const parentRef = doc(db, "parents", user.uid);
        const parentSnap = await getDoc(parentRef);

        if (!parentSnap.exists()) {
          setLoading(false);
          return;
        }

        const studentIds = parentSnap.data().studentIds || [];

        if (studentIds.length === 0) {
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "weeklyReports"),
          where("studentId", "in", studentIds),
          orderBy("weekStart", "desc"),
          limit(20)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => doc.data() as WeeklyReport);
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user]);

  if (loading) return <div className="p-8 text-center animate-premium-fade">Loading report history...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      <h1 className="text-3xl font-black mb-8 italic uppercase">Academic Reports</h1>

      {reports.length === 0 ? (
        <div className="bg-card border rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="text-muted-foreground font-bold">No weekly reports available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Reports are automatically generated every Sunday.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-card border-2 rounded-3xl p-6 hover:border-primary transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg">Week {report.weekId}</h3>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">
                    {report.weekStart.toDate().toLocaleDateString()} - {report.weekEnd.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                   <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none">
                    <path d="M7 7h10M7 12h10M7 17h10" />
                   </svg>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Study Time</span>
                  <span className="font-bold">{report.totalStudyMinutes} mins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Lessons</span>
                  <span className="font-bold">{report.lessonsCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Guarantee</span>
                  <span className="font-bold text-primary">{report.guaranteeProgress}%</span>
                </div>
              </div>

              <button className="w-full py-3 bg-muted group-hover:bg-primary/5 rounded-2xl font-bold text-sm transition-colors group-hover:text-primary">
                View Detailed Breakdown
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
