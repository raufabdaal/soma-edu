"use client";

import Link from "next/link";

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6 relative">
      {/* Background radial ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 animate-premium-slide relative">
        {/* Core Paywall Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.025)] relative overflow-hidden">
          {/* Top subtle highlight banner */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

          {/* Icon Header */}
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 mx-auto">
            <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-current stroke-[2] fill-none">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-3">
            Premium Access
          </h1>
          <p className="text-slate-500 text-sm font-medium text-center leading-relaxed mb-8">
            Your free trial has ended. Subscribe now to unlock full O-Level resources and secure your <span className="text-indigo-600 font-bold">80% grade guarantee</span>.
          </p>

          {/* Pricing Box */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-8 relative">
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              Popular
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Monthly Plan</p>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-black text-slate-900 tracking-tight">50,000</span>
              <span className="text-sm font-black text-slate-500 uppercase">UGX</span>
              <span className="text-slate-400 font-medium text-xs ml-1">/ month</span>
            </div>

            {/* Micro Feature Bullet Points */}
            <div className="space-y-3 pt-6 border-t border-slate-200/50">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500 stroke-current stroke-[3] fill-none shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Full O-Level Syllabuses (UNEB Standard)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500 stroke-current stroke-[3] fill-none shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Instant AI Marking & Corrections</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500 stroke-current stroke-[3] fill-none shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Weekly Parent Progress Reports</span>
              </div>
            </div>
          </div>

          {/* CTA Action button */}
          <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-[0_8px_20px_rgba(79,70,229,0.2)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.35)] transition-all duration-300 active:scale-[0.98]">
            Subscribe via Mobile Money
          </button>

          {/* Payment providers support text */}
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider mt-4">
            Supports MTN MoMo & Airtel Money
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link 
            href="/student/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current stroke-[3] fill-none" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
