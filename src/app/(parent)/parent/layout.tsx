"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (userProfile && userProfile.role !== "parent") {
      router.replace("/");
      return;
    }

    setAccessChecked(true);
  }, [user, userProfile, loading, router]);

  if (loading || !accessChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-muted-foreground animate-pulse tracking-widest uppercase">
          Verifying Parent Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/parent/dashboard" className="text-xl font-black text-primary tracking-tighter italic">
              SomaEdu
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/parent/dashboard" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">Overview</Link>
              <Link href="/parent/reports" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Reports</Link>
              <Link href="/parent/settings" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black italic leading-none">{userProfile?.displayName?.split(' ')[0]}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-70">Parent Account</p>
            </div>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t py-3 px-6 flex justify-between items-center z-50">
        <Link href="/parent/dashboard" className="flex flex-col items-center gap-1">
          <div className="w-1 h-1 bg-primary rounded-full"></div>
          <span className="text-[10px] font-black uppercase">Home</span>
        </Link>
        <Link href="/parent/reports" className="flex flex-col items-center gap-1 opacity-40">
          <span className="text-[10px] font-black uppercase">Reports</span>
        </Link>
        <Link href="/parent/settings" className="flex flex-col items-center gap-1 opacity-40">
          <span className="text-[10px] font-black uppercase">Settings</span>
        </Link>
      </div>
    </div>
  );
}
