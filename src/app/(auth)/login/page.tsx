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
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <div className="w-10 h-10 border-4 border-muted border-l-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md bg-card border shadow-sm rounded-xl p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SomaEdu Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isSignUp ? "Create a portal account to get started" : "Sign in to access your dashboard"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/20 rounded-md p-3 mb-6 text-sm font-medium flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-800 border border-green-200 rounded-md p-3 mb-6 text-sm font-medium flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <label className="text-sm font-medium text-foreground">
            Select Your Role {!isSignUp && <span className="text-muted-foreground font-normal">(for Google Registration)</span>}
          </label>
          <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg border">
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
              <label htmlFor="role-student" className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted-foreground peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm">
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
              <label htmlFor="role-parent" className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted-foreground peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm">
                Parent
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-l-primary-foreground rounded-full animate-spin"></div>
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
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full gap-2"
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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button type="button" className="ml-1 font-semibold text-primary hover:underline" onClick={toggleMode} disabled={submitting}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
