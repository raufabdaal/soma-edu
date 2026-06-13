"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export interface UserProfile {
  uid: string;
  email: string;
  role: "student" | "parent";
  displayName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  diagnosticCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string, role: "student" | "parent", displayName: string) => Promise<UserCredential>;
  loginWithGoogle: (roleForNewUser?: "student" | "parent") => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Document might not exist if they did Google Auth and we haven't written it yet,
            // or if they registered but the document write failed.
            // We set userProfile to null, but don't error out.
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user profile right after login to avoid lag
      const docRef = doc(db, "users", credential.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
      return credential;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    role: "student" | "parent",
    displayName: string
  ) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Auth display name
      await updateProfile(credential.user, { displayName });

      // Create profile document in Firestore
      const newProfile: UserProfile = {
        uid: credential.user.uid,
        email,
        role,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", credential.user.uid), newProfile);

      if (role === "student") {
        const studyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await setDoc(doc(db, "students", credential.user.uid), {
          userId: credential.user.uid,
          parentIds: [],
          level: "S3", // Default level
          enrolledSubjects: [],
          studyCode,
          subscriptionStatus: "trial",
          trialStartDate: new Date(),
          subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          diagnosticCompleted: false,
          diagnosticScores: {},
          predictedGrades: {},
        });
      } else if (role === "parent") {
        await setDoc(doc(db, "parents", credential.user.uid), {
          userId: credential.user.uid,
          studentIds: [],
          phone: "",
          whatsappOptIn: false,
          emailReportsOptIn: true,
        });
      }

      setUserProfile(newProfile);
      return credential;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async (roleForNewUser: "student" | "parent" = "student") => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const firebaseUser = credential.user;

      // Check if profile exists
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create a new profile with the selected role
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          role: roleForNewUser,
          displayName: firebaseUser.displayName || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(docRef, newProfile);

        if (roleForNewUser === "student") {
          const studyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          await setDoc(doc(db, "students", firebaseUser.uid), {
            userId: firebaseUser.uid,
            parentIds: [],
            level: "S3",
            enrolledSubjects: [],
            studyCode,
            subscriptionStatus: "trial",
            trialStartDate: new Date(),
            subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            diagnosticCompleted: false,
            diagnosticScores: {},
            predictedGrades: {},
          });
        } else if (roleForNewUser === "parent") {
          await setDoc(doc(db, "parents", firebaseUser.uid), {
            userId: firebaseUser.uid,
            studentIds: [],
            phone: "",
            whatsappOptIn: false,
            emailReportsOptIn: true,
          });
        }

        setUserProfile(newProfile);
      } else {
        setUserProfile(docSnap.data() as UserProfile);
      }
      return credential;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
