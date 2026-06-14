"use client";

import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 relative">
      {/* Soft background glow */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto p-6 md:p-10 max-w-2xl animate-premium-slide">
        {/* Page Header */}
        <div className="mb-10">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/60">
            Account Management
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3">
            Parent Settings
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Update your parent account preferences, profile details, and email notification configurations.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.015)]">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Display Name</label>
                <p className="font-bold text-slate-700">{userProfile?.displayName || "Parent Account"}</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Email Address</label>
                <p className="font-bold text-slate-700">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.015)]">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                 <div>
                    <p className="font-bold text-slate-700 text-sm">Weekly Email Reports</p>
                    <p className="text-xs text-slate-400 font-medium">Receive student academic summaries every Sunday.</p>
                 </div>
                 {/* IOS Switch style */}
                 <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner shadow-indigo-700/10">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => logout()}
            className="w-full py-4 bg-rose-50 text-rose-600 border border-rose-100/60 rounded-3xl font-black text-xs uppercase tracking-wider hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-lg hover:shadow-rose-600/10 transition-all duration-300 active:scale-[0.99]"
          >
            Sign Out of Portal
          </button>
        </div>
      </div>
    </div>
  );
}
