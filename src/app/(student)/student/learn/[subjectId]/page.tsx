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
          where("isActive", "==", true),
          orderBy("order", "asc")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));

        if (data.length > 0) {
          setTopics(data);
        } else {
          // Mock topics for specific subject
          setTopics([
            { id: 'topic1', subjectId: subjectId as string, title: "Foundations & Introduction", description: "The starting point for this subject.", order: 1, totalLessons: 5, estimatedHours: 4, isActive: true },
            { id: 'topic2', subjectId: subjectId as string, title: "Advanced Applications", description: "Applying core concepts to complex problems.", order: 2, totalLessons: 8, estimatedHours: 6, isActive: true },
            { id: 'topic3', subjectId: subjectId as string, title: "Exam Preparation", description: "Focusing on UNEB marking schemes and patterns.", order: 3, totalLessons: 4, estimatedHours: 3, isActive: true },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [subjectId]);

  if (loading) return <div className="p-8 text-center animate-premium-fade">Loading modules...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      <Link href="/student/learn" className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        All Subjects
      </Link>

      <h1 className="text-3xl font-black mb-10 italic uppercase">Curriculum Topics</h1>

      <div className="space-y-4 max-w-4xl">
        {topics.map((topic, i) => (
          <Link
            key={topic.id}
            href={`/student/learn/${subjectId}/${topic.id}/lesson1`} // Placeholder lesson logic
            className="group block bg-card border-2 rounded-2xl p-6 hover:border-primary/40 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-xl font-black group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {i + 1}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-1">{topic.title}</h2>
                <p className="text-sm text-muted-foreground font-medium">{topic.description}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase text-muted-foreground">{topic.totalLessons} Lessons</p>
                <p className="text-[10px] font-bold text-primary">{topic.estimatedHours} Hours</p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
