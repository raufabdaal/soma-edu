"use client";

import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, userProfile, logout } = useAuth();

  return (
    <div className="container mx-auto p-4 md:p-8 animate-premium-slide">
      <h1 className="text-3xl font-black mb-8 italic uppercase">Parent Settings</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-black italic mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Display Name</label>
              <p className="font-bold">{userProfile?.displayName || "Not set"}</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Email Address</label>
              <p className="font-bold">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-black italic mb-6">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div>
                  <p className="font-bold text-sm">Weekly Email Reports</p>
                  <p className="text-xs text-muted-foreground">Receive academic summaries every Sunday.</p>
               </div>
               <div className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
               </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full py-4 bg-destructive/10 text-destructive rounded-3xl font-black hover:bg-destructive hover:text-destructive-foreground transition-all"
        >
          Sign Out of Portal
        </button>
      </div>
    </div>
  );
}
