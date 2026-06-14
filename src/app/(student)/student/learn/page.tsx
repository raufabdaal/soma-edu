"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Subject } from "@/types";
import Link from "next/link";

// Subject icon mapping — we pick an SVG based on name
const subjectIcons: Record<string, JSX.Element> = {
  mathematics: (
    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
      <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  biology: (
    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M12 22V12M12 12C12 12 7 10 7 6a5 5 0 0 1 10 0c0 4-5 6-5 6z" />
    </svg>
  ),
  chemistry: (
    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M9 3h6l1 9H8L9 3zM6 21h12l-2-9H8L6 21z" />
    </svg>
  ),
  physics: (
    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  english: (
    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  ),
};

function getSubjectIcon(id: string): JSX.Element {
  const key = Object.keys(subjectIcons).find((k) => id.toLowerCase().includes(k));
  return key ? subjectIcons[key] : (
    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(collection(db, "subjects"), where("isActive", "==", true));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Subject));

        if (data.length > 0) {
          setSubjects(data);
        } else {
          // Fallback mock data until seeder is run
          setSubjects([
            { id: "mathematics", name: "Mathematics", level: "O-Level", description: "Master core O-Level math: algebra, geometry, statistics, and calculus foundations.", accentColor: "#2563EB", totalTopics: 8, isActive: true },
            { id: "biology", name: "Biology", level: "O-Level", description: "Explore living organisms from cell biology to ecosystems and genetics.", accentColor: "#16A34A", totalTopics: 12, isActive: true },
            { id: "chemistry", name: "Chemistry", level: "O-Level", description: "Understand matter, chemical bonding, reactions, and organic compounds.", accentColor: "#7C3AED", totalTopics: 10, isActive: true },
          ]);
        }
      } catch (err) {
        console.error("[SubjectsPage] fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
            Loading curriculum...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Subtle background gradient for visual depth */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-7xl animate-premium-slide">
        {/* Page Header */}
        <div className="mb-10">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/60">
            O-Level Curriculum
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3">
            Choose a Subject
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Select a subject to access topics, lessons, and exam practice.
          </p>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/student/learn/${subject.id}`}
              className="group bg-white border border-slate-100 rounded-[32px] p-8 overflow-hidden hover:shadow-[0_25px_50px_rgba(0,0,0,0.04)] shadow-[0_10px_30px_rgba(0,0,0,0.015)] transition-all duration-300 hover:translate-y-[-4px] hover:border-slate-200 flex flex-col justify-between"
            >
              {/* Icon + Level badge */}
              <div className="flex justify-between items-start mb-8">
                {/* Colored icon box — uses subject's own accent color */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${subject.accentColor}10`,
                    color: subject.accentColor,
                    border: `1px solid ${subject.accentColor}20`,
                  }}
                >
                  {getSubjectIcon(subject.id)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                  {subject.level}
                </span>
              </div>

              {/* Name + Description */}
              <div className="flex-1">
                <h2 className="text-2xl font-black text-slate-900 mb-2">{subject.name}</h2>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {subject.description}
                </p>
              </div>

              {/* Footer: topic count + CTA arrow */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {subject.totalTopics} Topics
                </span>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md"
                  style={{
                    backgroundColor: subject.accentColor,
                    color: "white",
                    boxShadow: `0 8px 20px ${subject.accentColor}30`,
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
