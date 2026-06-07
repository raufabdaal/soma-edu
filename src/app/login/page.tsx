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
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Authenticating...
        </p>
      </div>
    );
  }

  return (
    <div className="container auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h1 className="auth-title">SomaEdu Portal</h1>
          <p className="auth-subtitle">
            {isSignUp ? "Create a portal account to get started" : "Sign in to access your dashboard"}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Role Selector (visible during sign-up, or before Google Sign-In) */}
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Select Your Role {!isSignUp && "(for Google Registration)"}</label>
          <div className="role-selector">
            <input
              type="radio"
              id="role-student"
              name="role"
              className="role-option"
              checked={role === "student"}
              onChange={() => setRole("student")}
              disabled={submitting}
            />
            <label htmlFor="role-student" className="role-label">Student</label>

            <input
              type="radio"
              id="role-parent"
              name="role"
              className="role-option"
              checked={role === "parent"}
              onChange={() => setRole("parent")}
              disabled={submitting}
            />
            <label htmlFor="role-parent" className="role-label">Parent</label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={submitting}>
            {submitting ? (
              <span className="flex-center" style={{ gap: "0.5rem" }}>
                <span className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                Processing...
              </span>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <button
          type="button"
          className="btn btn-google"
          style={{ width: "100%", gap: "0.75rem" }}
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

        <div className="auth-toggle">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button type="button" className="auth-toggle-btn" onClick={toggleMode} disabled={submitting}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
