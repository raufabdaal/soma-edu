"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Topic, Subject } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TopicSelection() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Subject
        const sSnap = await getDoc(doc(db, "subjects", subjectId as string));
        if (sSnap.exists()) setSubject({ id: sSnap.id, ...sSnap.data() } as Subject);

        // Fetch Topics
        const q = query(
          collection(db, "topics"),
          where("subjectId", "==", subjectId),
          where("isActive", "==", true),
          orderBy("order", "asc")
        );
        const tSnap = await getDocs(q);
        const tData = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));

        if (tData.length === 0) {
          // Mocks
          setTopics([
            { id: 'bio_s3_photosynthesis', subjectId: 'biology_s3', title: 'Plant Nutrition & Photosynthesis', description: 'How plants make food', order: 1, totalLessons: 5, estimatedHours: 3, isActive: true },
            { id: 'bio_s3_respiration', subjectId: 'biology_s3', title: 'Cellular Respiration', description: 'Energy release in cells', order: 2, totalLessons: 4, estimatedHours: 2, isActive: true },
          ]);
        } else {
          setTopics(tData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId]);

  if (loading) return <div className="p-8 text-center animate-premium-fade">Loading topics...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Link href="/student/learn" className="text-sm font-bold text-primary flex items-center gap-1 mb-4 hover:underline">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Subjects
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{subject?.name || "Topics"}</h1>
          <p className="text-muted-foreground font-medium">Select a topic to begin your lessons.</p>
        </div>
      </div>

      <div className="max-w-4xl space-y-4">
        {topics.map((topic, index) => (
          <div
            key={topic.id}
            className="bg-card border-2 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all shadow-sm"
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-black text-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{topic.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{topic.totalLessons} Lessons</p>
                  <p className="text-xs font-medium text-muted-foreground opacity-70">~{topic.estimatedHours}h study time</p>
                </div>
                <Link
                  href={`/student/learn/${subjectId}/${topic.id}/lesson_1`}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Start Topic
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
