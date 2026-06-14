"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, userProfile, loading, loginWithEmail, signUpWithEmail, loginWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"student" | "parent">("student");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to correct dashboard
  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === "student") {
        router.replace("/student/dashboard");
      } else if (userProfile.role === "parent") {
        router.replace("/parent/dashboard");
      }
    }
  }, [user, userProfile, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (isSignUp && !displayName) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, role, displayName);
        setSuccess("Account created successfully!");
        // Redirection is handled by the useEffect above
      } else {
        await loginWithEmail(email, password);
        // Redirection is handled by the useEffect above
      }
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as { code?: string; message?: string };
      let message = "An authentication error occurred.";
      if (errorObj.code === "auth/user-not-found" || errorObj.code === "auth/wrong-password" || errorObj.code === "auth/invalid-credential") {
        message = "Incorrect email or password.";
      } else if (errorObj.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (errorObj.code === "auth/invalid-email") {
        message = "Invalid email address format.";
      } else if (errorObj.message) {
        message = errorObj.message;
      }
      setError(message);
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      // Pass currently selected role, used if the Google account has no profile yet
      await loginWithGoogle(role);
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as { code?: string; message?: string };
      if (errorObj.code !== "auth/popup-closed-by-user") {
        setError(errorObj.message || "Failed to sign in with Google.");
      }
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(null);
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

  if (loading || (user && userProfile)) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-md z-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-sm font-bold text-slate-800 tracking-wider uppercase animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/30 via-slate-50 to-violet-50/40 p-4">
      {/* Decorative background grid/blobs for modern premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[440px] bg-white border border-slate-100/80 shadow-[0_20px_50px_rgba(79,70,229,0.06)] rounded-[32px] p-10 transition-all duration-300">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/5 text-indigo-600 mb-4 font-black text-xl">
            S.
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SomaEdu</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {isSignUp ? "Create your learning portal account" : "Welcome back. Sign in to your portal"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100/50 rounded-2xl p-4 mb-6 text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100/50 rounded-2xl p-4 mb-6 text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Choose Role
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-100/30">
            <div>
              <input
                type="radio"
                id="role-student"
                name="role"
                className="peer sr-only"
                checked={role === "student"}
                onChange={() => setRole("student")}
                disabled={submitting}
              />
              <label htmlFor="role-student" className="flex items-center justify-center h-11 text-sm font-bold rounded-xl cursor-pointer transition-all text-slate-500 peer-checked:bg-white peer-checked:text-indigo-600 peer-checked:shadow-sm">
                Student
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="role-parent"
                name="role"
                className="peer sr-only"
                checked={role === "parent"}
                onChange={() => setRole("parent")}
                disabled={submitting}
              />
              <label htmlFor="role-parent" className="flex items-center justify-center h-11 text-sm font-bold rounded-xl cursor-pointer transition-all text-slate-500 peer-checked:bg-white peer-checked:text-indigo-600 peer-checked:shadow-sm">
                Parent
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Ex. John Doe"
                className="flex h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-medium transition-all placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-50"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="flex h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-medium transition-all placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="flex h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-medium transition-all placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full h-13 mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-l-white rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
            <span className="bg-white px-3 text-slate-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full h-13 border border-slate-200/80 bg-white hover:bg-slate-50 font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          onClick={handleGoogleSignIn}
          disabled={submitting}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google Sign In
        </button>

        <div className="mt-6 text-center text-sm font-medium text-slate-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button type="button" className="ml-1 font-bold text-indigo-600 hover:underline" onClick={toggleMode} disabled={submitting}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
