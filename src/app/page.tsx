"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (userProfile) {
        if (userProfile.role === "student") {
          router.replace("/student/dashboard");
        } else if (userProfile.role === "parent") {
          router.replace("/parent/dashboard");
        }
      } else {
        // Logged in but profile hasn't loaded or doesn't exist
        router.replace("/login");
      }
    }
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
