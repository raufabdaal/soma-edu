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
    <div className="full-screen-loader">
      <div className="spinner"></div>
      <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
        Redirecting you to portal...
      </p>
    </div>
  );
}
