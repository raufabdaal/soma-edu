"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      if (userProfile && userProfile.role !== "student") {
        router.replace("/");
        return;
      }

      // Detailed subscription gating
      try {
        const studentSnap = await getDoc(doc(db, "students", user.uid));
        if (studentSnap.exists()) {
          const data = studentSnap.data();
          const now = new Date();
          const isTrial = data.subscriptionStatus === 'trial';
          const isActive = data.subscriptionStatus === 'active';
          const expiry = data.subscriptionExpiry?.toDate();

          if (isActive && expiry && expiry < now) {
            router.replace("/subscribe?status=expired");
          } else if (isTrial && data.trialStartDate) {
            const trialEnd = new Date(data.trialStartDate.toDate());
            trialEnd.setDate(trialEnd.getDate() + 14);
            if (trialEnd < now) {
              router.replace("/subscribe?status=trial_ended");
            }
          } else if (!isActive && !isTrial) {
            router.replace("/subscribe");
          }
        }
      } catch (error) {
        console.error("Access check error:", error);
      }
    };

    checkAccess();
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
      <main>
        {children}
      </main>
    </div>
  );
}
