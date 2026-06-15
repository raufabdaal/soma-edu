"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Topic } from "@/types";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TopicsPage() {
  const { subjectId } = useParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const q = query(
          collection(db, "topics"),
          where("subjectId", "==", subjectId),
          where("isActive", "==", true)
        );
        const snap = await getDocs(q);
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Topic))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (data.length > 0) {
          setTopics(data);
        } else {
          // Dynamic fallback based on selected subject for authentic mock data
          const formattedSubject = typeof subjectId === "string" ? subjectId.toLowerCase() : "";
          if (formattedSubject.includes("math")) {
            setTopics([
              { id: 'topic_alg', subjectId: subjectId as string, title: "Algebraic Expressions & Equations", description: "Master solving linear, quadratic, and simultaneous equations along with inequalities.", order: 1, totalLessons: 5, estimatedHours: 4, isActive: true },
              { id: 'topic_trig', subjectId: subjectId as string, title: "Trigonometry & Geometry", description: "Understand angles, triangle relationships, sine/cosine rules, and coordinate geometry.", order: 2, totalLessons: 8, estimatedHours: 6, isActive: true },
              { id: 'topic_stats', subjectId: subjectId as string, title: "Statistics & Probability", description: "Collect, represent, analyze data sets, and compute mathematical probability.", order: 3, totalLessons: 4, estimatedHours: 3, isActive: true },
            ]);
          } else if (formattedSubject.includes("bio")) {
            setTopics([
              { id: 'topic_cells', subjectId: subjectId as string, title: "Cell Structure & Organization", description: "Explore plant and animal cells, specialized cell types, and microscopic details.", order: 1, totalLessons: 6, estimatedHours: 5, isActive: true },
              { id: 'topic_photo', subjectId: subjectId as string, title: "Photosynthesis & Nutrition", description: "Understand leaf structure, biochemical equations, and nutrient translocation.", order: 2, totalLessons: 5, estimatedHours: 4, isActive: true },
              { id: 'topic_eco', subjectId: subjectId as string, title: "Ecology & Human Impact", description: "Study ecosystems, energy flows, food webs, and environmental conservation in East Africa.", order: 3, totalLessons: 5, estimatedHours: 4, isActive: true },
            ]);
          } else {
            setTopics([
              { id: 'topic1', subjectId: subjectId as string, title: "Foundations & Core Principles", description: "The starting point and essential building blocks for this subject.", order: 1, totalLessons: 5, estimatedHours: 4, isActive: true },
              { id: 'topic2', subjectId: subjectId as string, title: "Advanced Applications", description: "Applying core concepts to complex problems and multi-step solutions.", order: 2, totalLessons: 8, estimatedHours: 6, isActive: true },
              { id: 'topic3', subjectId: subjectId as string, title: "UNEB Exam Practice", description: "Focusing on UNEB marking schemes, past paper patterns, and common pitfalls.", order: 3, totalLessons: 4, estimatedHours: 3, isActive: true },
            ]);
          }
        }
      } catch (err) {
        console.error("[TopicsPage] Error fetching topics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
            Loading Modules...
          </p>
        </div>
      </div>
    );
  }

  // Capitalize subject ID for display
  const subjectName = typeof subjectId === "string" 
    ? subjectId.charAt(0).toUpperCase() + subjectId.slice(1) 
    : "Subject";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 relative">
      {/* Background soft glow gradient */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-4xl animate-premium-slide">
        {/* Navigation Breadcrumb */}
        <Link 
          href="/student/learn" 
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
          Back to subjects
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/60">
            {subjectName} Syllabus
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3">
            Syllabus Topics
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Complete the lessons and quizzes below to master your O-Level topics.
          </p>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.map((topic, i) => (
            <Link
              key={topic.id}
              href={`/student/learn/${subjectId}/${topic.id}`}
              className="group block bg-white border border-slate-100 rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all duration-300 hover:translate-y-[-2px] active:scale-[0.99]"
            >
              <div className="flex items-center gap-5">
                {/* Index badge */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 text-indigo-600 border border-indigo-100/30 flex items-center justify-center text-lg font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {i + 1}
                </div>
                
                {/* Text details */}
                <div className="flex-1">
                  <h2 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors mb-1">
                    {topic.title}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                {/* Desktop stats badge */}
                <div className="text-right hidden sm:block pr-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">{topic.totalLessons} Lessons</p>
                  <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {topic.estimatedHours} Hours
                  </p>
                </div>

                {/* Chevron icon */}
                <div className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-indigo-100 group-hover:bg-indigo-50/50 group-hover:text-indigo-600 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[3] fill-none">
                    <path d="M9 18l6-6-6-6" />
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
