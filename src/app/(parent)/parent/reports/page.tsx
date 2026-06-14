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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
            Loading report history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 relative">
      {/* Soft background glow */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-7xl animate-premium-slide">
        {/* Page Header */}
        <div className="mb-10">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/60">
            Performance Tracking
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3">
            Academic Reports
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Review weekly progress reports and study milestones for your connected student accounts.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center shadow-[0_15px_30px_rgba(0,0,0,0.01)] max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-current stroke-[2] fill-none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">No Reports Generated Yet</h3>
            <p className="text-slate-500 text-sm font-medium mb-1">
              Academic summaries are automatically compiled every Sunday.
            </p>
            <p className="text-slate-400 text-xs font-medium">
              Ensure you have connected a student profile using their study code.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="group bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.04)] hover:border-slate-200/80 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-black text-slate-800 text-xl group-hover:text-indigo-600 transition-colors">Week {report.weekId}</h3>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">
                        {report.weekStart.toDate().toLocaleDateString()} - {report.weekEnd.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/20">
                       <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current stroke-[2.5] fill-none">
                        <path d="M7 7h10M7 12h10M7 17h10" />
                       </svg>
                    </div>
                  </div>

                  <div className="space-y-3.5 mb-8">
                    <div className="flex justify-between items-center bg-slate-50/50 px-4 py-2.5 rounded-xl border border-slate-100/50">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Study Duration</span>
                      <span className="font-black text-slate-800 text-sm">{report.totalStudyMinutes} mins</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/50 px-4 py-2.5 rounded-xl border border-slate-100/50">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Lessons Done</span>
                      <span className="font-black text-slate-800 text-sm">{report.lessonsCompleted}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/50 px-4 py-2.5 rounded-xl border border-slate-100/50">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Milestone Progress</span>
                      <span className="font-black text-indigo-600 text-sm">{report.guaranteeProgress}%</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-slate-50 text-slate-600 border border-slate-100/80 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-300">
                  View Detailed Breakdown
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
