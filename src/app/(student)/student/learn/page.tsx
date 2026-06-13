"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Subject } from "@/types";
import Link from "next/link";

export default function SubjectSelection() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(collection(db, "subjects"), where("isActive", "==", true));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));

        // Use mocks if DB is empty for initial demo
        if (data.length === 0) {
          setSubjects([
            { id: 'math_s3', name: 'Mathematics', level: 'S3', description: 'Core math curriculum', totalTopics: 5, isActive: true, accentColor: '#2563EB' },
            { id: 'biology_s3', name: 'Biology', level: 'S3', description: 'Study of living things', totalTopics: 5, isActive: true, accentColor: '#16A34A' },
            { id: 'chemistry_s3', name: 'Chemistry', level: 'S3', description: 'Matter and reactions', totalTopics: 5, isActive: true, accentColor: '#7C3AED' },
          ]);
        } else {
          setSubjects(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) return <div className="p-8 text-center animate-premium-fade">Loading subjects...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">What do you want to learn today?</h1>
        <p className="text-muted-foreground font-medium">Select a subject to see topics and lessons.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/student/learn/${subject.id}`}
            className="group relative bg-card border-2 rounded-3xl p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
          >
            <div
              className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: subject.accentColor }}
            >
              <span className="text-2xl font-black">{subject.name[0]}</span>
            </div>

            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{subject.name}</h3>
            <p className="text-sm text-muted-foreground font-medium mb-6 leading-relaxed">
              {subject.description}
            </p>

            <div className="flex items-center justify-between pt-6 border-t">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {subject.totalTopics} Topics
              </span>
              <div className="flex items-center gap-1 text-primary font-bold text-sm">
                Start Learning
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
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
