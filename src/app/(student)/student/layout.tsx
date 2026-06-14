"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Loading state - do nothing
      if (loading) return;

      // 2. No user - definitely redirect
      if (!user) {
        console.log("[StudentLayout] No user found, redirecting to login");
        router.replace("/login");
        return;
      }

      // 3. Right role but profile still syncing? Give it a moment or continue
      if (userProfile && userProfile.role !== "student") {
        router.replace("/");
        return;
      }

      // 4. Perform database check for subscription
      try {
        const studentSnap = await getDoc(doc(db, "students", user.uid));
        if (studentSnap.exists()) {
          const data = studentSnap.data();
          const now = new Date();
          const status = data.subscriptionStatus;

          if (status === 'active') {
            const expiry = data.subscriptionExpiry?.toDate();
            if (expiry && expiry < now) {
              router.replace("/subscribe?status=expired");
              return;
            }
          } else if (status === 'trial') {
            if (data.trialStartDate) {
               const trialEnd = new Date(data.trialStartDate.toDate());
               trialEnd.setDate(trialEnd.getDate() + 14);
               if (trialEnd < now) {
                 router.replace("/subscribe?status=trial_ended");
                 return;
               }
            }
          } else if (status === 'expired') {
            router.replace("/subscribe?status=expired");
            return;
          }
        }

        // If we reach here, we're good
        setAccessChecked(true);
      } catch (error) {
        console.error("[StudentLayout] Sync Error:", error);
        // Fallback: allow access on secondary errors to prevent loops
        setAccessChecked(true);
      }
    };

    checkAccess();
  }, [user, userProfile, loading, router]);

  // Show a clean loader
  if (loading || (!accessChecked && user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-muted-foreground animate-pulse tracking-widest uppercase">
          Verifying Access...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/student/dashboard" className="text-xl font-black text-primary tracking-tighter">
              SomaEdu
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/student/dashboard" className="text-sm font-bold hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/student/learn" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Learn</Link>
              <Link href="/student/practice" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Practice</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{userProfile?.displayName || user.displayName}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-70">Student</p>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs font-bold bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="pb-20">
        {children}
      </main>
    </div>
  );
}
