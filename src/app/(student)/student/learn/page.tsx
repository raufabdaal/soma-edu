"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Subject } from "@/types";
import Link from "next/link";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(collection(db, "subjects"), where("isActive", "==", true));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));

        if (data.length > 0) {
          setSubjects(data);
        } else {
          // Mock data for initial dev if DB is empty
          setSubjects([
            { id: 'mathematics', name: 'Mathematics', level: 'O-Level', description: 'Core math concepts for O-Level', accentColor: '#2563EB', totalTopics: 1, isActive: true },
            { id: 'biology', name: 'Biology', level: 'O-Level', description: 'Study of living organisms', accentColor: '#16A34A', totalTopics: 1, isActive: true },
            { id: 'chemistry', name: 'Chemistry', level: 'O-Level', description: 'Matter and chemical reactions', accentColor: '#7C3AED', totalTopics: 1, isActive: true },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) return <div className="p-8 text-center animate-premium-fade">Exploring curriculum...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      <h1 className="text-3xl font-black mb-8 italic">Choose a Subject</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/student/learn/${subject.id}`}
            className="group relative bg-card border-2 rounded-3xl p-8 overflow-hidden hover:border-primary/50 transition-all hover:translate-y-[-4px] active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full transition-colors group-hover:bg-primary/10"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">{subject.level} Curriculum</span>
            <h2 className="text-2xl font-black mb-4">{subject.name}</h2>
            <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">{subject.description}</p>

            <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-primary">{subject.totalTopics} Topics</span>
               <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
