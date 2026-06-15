"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // If user is authenticated but userProfile is still null, wait for onAuthStateChanged to load the profile from Firestore.
    if (!userProfile) {
      console.log("[ParentLayout] User exists but userProfile is not loaded yet.");
      return;
    }

    if (userProfile.role !== "parent") {
      router.replace("/");
    } else {
      setAccessChecked(true);
    }
  }, [user, userProfile, loading, router]);

  if (loading || !accessChecked) {
    return (
      // Premium loading screen matching design language
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-b-violet-500/30 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
          Verifying Parent Portal...
        </p>
      </div>
    );
  }

  // Helper to determine active route
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/parent/dashboard" className="flex items-center gap-2">
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
                { href: "/parent/dashboard", label: "Overview" },
                { href: "/parent/reports", label: "Reports" },
                { href: "/parent/settings", label: "Settings" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
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
              {/* Avatar initial */}
              <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-700 flex items-center justify-center font-black text-sm border border-indigo-100">
                {(userProfile?.displayName || "P").charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {userProfile?.displayName?.split(" ")[0]}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-0.5">
                  Parent
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

      <main className="pb-20">{children}</main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 py-3 px-8 flex justify-between items-center z-50">
        {[
          { href: "/parent/dashboard", label: "Home", icon: (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )},
          { href: "/parent/reports", label: "Reports", icon: (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
          )},
          { href: "/parent/settings", label: "Settings", icon: (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          )},
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(href) ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            {icon}
            <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
