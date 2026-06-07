"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  // While auth state is loading, show spinner
  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Loading profile...
        </p>
      </div>
    );
  }

  // If not logged in, do not render layout content while redirecting
  if (!user) {
    return null;
  }

  // Role check guard (if user is a parent, redirect to parent dashboard)
  if (userProfile && userProfile.role !== "student") {
    return (
      <div className="container" style={{ marginTop: "10vh", maxWidth: "500px" }}>
        <div className="glass-panel" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ color: "var(--error)", fontSize: "1.8rem", fontWeight: 800 }}>Access Denied</h2>
          <p style={{ color: "var(--text-muted)" }}>
            This section is restricted to students. You are logged in as a <strong style={{ textTransform: "capitalize" }}>{userProfile.role}</strong>.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => router.push("/parent/dashboard")}>
              Go to Parent Portal
            </button>
            <button className="btn btn-secondary" onClick={() => logout()}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ minHeight: "100vh" }}>
      <header style={{ background: "rgba(10, 10, 15, 0.3)", borderBottom: "1px solid var(--border-glass)", backdropFilter: "blur(12px)" }}>
        <div className="container navbar" style={{ borderBottom: "none", marginBottom: 0 }}>
          <div className="nav-logo" style={{ cursor: "pointer" }} onClick={() => router.push("/student/dashboard")}>
            SomaEdu
          </div>
          <div className="nav-user">
            <div className="nav-user-info">
              <span className="nav-user-name">{userProfile?.displayName || user.displayName || "Student"}</span>
              <span className="nav-user-role role-student">Student</span>
            </div>
            <button className="btn btn-danger" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }} onClick={() => logout()}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container" style={{ padding: "2rem 0" }}>
        {children}
      </main>
    </div>
  );
}
