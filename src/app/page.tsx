"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (userProfile) {
      if (userProfile.role === "student") {
        router.replace("/student/dashboard");
      } else if (userProfile.role === "parent") {
        router.replace("/parent/dashboard");
      } else {
        // Handle other roles or default
        router.replace("/login");
      }
    }
    // If user is authenticated but userProfile is still null,
    // we wait for the next render where userProfile might be loaded.
  }, [user, userProfile, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 text-xs font-black uppercase tracking-widest text-primary/70 animate-pulse">
        Initializing SomaEdu...
      </p>
    </div>
  );
}
