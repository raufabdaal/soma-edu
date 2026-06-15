"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Lesson, Topic } from "@/types";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function LessonsListPage() {
  const { subjectId, topicId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch topic metadata for display in the page header
        const topicSnap = await getDoc(doc(db, "topics", topicId as string));
        if (topicSnap.exists()) {
          setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);
        }

        // Fetch all lessons belonging to this topic ordered by sequence
        // This ensures we link to REAL Firestore lesson IDs, not hardcoded stubs
        const q = query(
          collection(db, "lessons"),
          where("topicId", "==", topicId),
          where("isActive", "==", true)
        );
        const snap = await getDocs(q);
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Lesson))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        console.log("[LessonsListPage] Fetched lessons:", data.length, data.map(l => l.id));
        setLessons(data);
      } catch (err) {
        console.error("[LessonsListPage] Error fetching lessons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [topicId, subjectId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
            Loading Lessons...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 relative">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-4xl animate-premium-slide">
        <Link
          href={`/student/learn/${subjectId}`}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 mb-8 transition-colors group"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to topics
        </Link>

        <div className="mb-10">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/60">
            {lessons.length} Lessons
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3">
            {topic?.title || "Lessons"}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {topic?.description || "Complete each lesson to build mastery in this topic."}
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-[32px] border border-slate-100">
            <p className="text-lg font-bold">No lessons found for this topic.</p>
            <p className="text-sm mt-2 font-medium">
              Visit /admin/seed to populate content.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, i) => (
              <Link
                key={lesson.id}
                href={`/student/learn/${subjectId}/${topicId}/${lesson.id}`}
                className="group block bg-white border border-slate-100 rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all duration-300 hover:translate-y-[-2px] active:scale-[0.99]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 text-indigo-600 border border-indigo-100/30 flex items-center justify-center text-lg font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                    {i + 1}
                  </div>

                  <div className="flex-1">
                    <h2 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors mb-1">
                      {lesson.title}
                    </h2>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      {lesson.estimatedMinutes} min &middot; {lesson.blocks.length} sections
                    </p>
                  </div>

                  <div className="text-right hidden sm:block pr-2">
                    <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                      ~{lesson.estimatedMinutes} min
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-indigo-100 group-hover:bg-indigo-50/50 group-hover:text-indigo-600 transition-all duration-300">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[3] fill-none">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}