import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Using hardcoded config provided by user to ensure immediate functionality
const firebaseConfig = {
  apiKey: "AIzaSyC6jn5xiJo4ERMOaYiOVX1QDSKrj5dpHvI",
  authDomain: "soma-edu.firebaseapp.com",
  projectId: "soma-edu",
  storageBucket: "soma-edu.firebasestorage.app",
  messagingSenderId: "632701595754",
  appId: "1:632701595754:web:84b02d8a43030be7919a13",
  measurementId: "G-BVGFFNC2CV"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
