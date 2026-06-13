"use client";

import Link from "next/link";

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center text-primary">
          <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight">Premium Access</h1>
        <p className="text-muted-foreground font-medium">
          Your free trial has ended. Subscribe now to continue your journey towards an 80% guarantee.
        </p>
        <div className="bg-card border-2 border-primary p-6 rounded-3xl shadow-xl shadow-primary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Monthly Plan</p>
          <p className="text-4xl font-black mb-6">50,000 UGX</p>
          <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20">
            Subscribe via Mobile Money
          </button>
        </div>
        <Link href="/student/dashboard" className="block text-sm font-bold text-muted-foreground hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
