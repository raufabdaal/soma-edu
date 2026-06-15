"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        console.log("[StudentLayout] No user found, redirecting to login");
        router.replace("/login");
        return;
      }

      // Wait until both user and userProfile are loaded.
      // If user exists but userProfile is still null, we are still loading the profile from Firestore.
      if (!userProfile) {
        console.log("[StudentLayout] User exists but userProfile is not loaded yet.");
        return;
      }
      
      if (userProfile.role !== "student") {
        router.replace("/");
        return;
      }

      try {
        const studentSnap = await getDoc(doc(db, "students", user.uid));
        if (studentSnap.exists()) {
          const data = studentSnap.data();
          const now = new Date();
          const status = data.subscriptionStatus;

          if (status === "active") {
            const expiry = data.subscriptionExpiry?.toDate();
            if (expiry && expiry < now) {
              router.replace("/subscribe?status=expired");
              return;
            }
          } else if (status === "trial") {
            if (data.trialStartDate) {
              const trialEnd = new Date(data.trialStartDate.toDate());
              trialEnd.setDate(trialEnd.getDate() + 14);
              if (trialEnd < now) {
                router.replace("/subscribe?status=trial_ended");
                return;
              }
            }
          } else if (status === "expired") {
            router.replace("/subscribe?status=expired");
            return;
          }
        }

        setAccessChecked(true);
      } catch (error) {
        console.error("[StudentLayout] Sync Error:", error);
        setAccessChecked(true);
      }
    };

    checkAccess();
  }, [user, userProfile, loading, router]);

  if (loading || (!accessChecked && user)) {
    return (
      // Full-screen loader with premium background gradient
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-b-violet-500/30 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
          Verifying Access...
        </p>
      </div>
    );
  }

  if (!user) return null;

  // Helper to determine if a nav link is active
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium sticky header with glassmorphism effect */}
      <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/student/dashboard"
              className="flex items-center gap-2"
            >
              {/* Gradient logo mark */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Soma<span className="text-indigo-600">Edu</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/student/dashboard", label: "Dashboard" },
                { href: "/student/learn", label: "Learn" },
                { href: "/student/practice", label: "Practice" },
                { href: "/student/tutor", label: "AI Tutor" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  // Active link gets solid indigo bg; inactive is subtle hover
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive(href)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              {/* Avatar initial circle */}
              <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-700 flex items-center justify-center font-black text-sm border border-indigo-100">
                {(userProfile?.displayName || user.displayName || "S")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {userProfile?.displayName || user.displayName}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-0.5">
                  Student
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24">{children}</main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 py-3.5 px-6 flex justify-between items-center z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.015)]">
        {[
          {
            href: "/student/dashboard",
            label: "Home",
            icon: (
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
          {
            href: "/student/learn",
            label: "Learn",
            icon: (
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            ),
          },
          {
            href: "/student/practice",
            label: "Practice",
            icon: (
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            ),
          },
          {
            href: "/student/tutor",
            label: "Tutor",
            icon: (
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ),
          },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(href) ? "text-indigo-600 font-bold" : "text-slate-400 font-semibold"
            }`}
          >
            {icon}
            <span className="text-[9px] uppercase tracking-wider mt-0.5">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
