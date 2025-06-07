import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FRONTEND_API_GOOGLE_AUTHENTICATE,
  authDomain: "otakusensei-c883c.firebaseapp.com",
  projectId: "otakusensei-c883c",
  storageBucket: "otakusensei-c883c.firebasestorage.app",
  messagingSenderId: "946352631459",
  appId: "1:946352631459:web:eb53af2bf527769af99916",
  measurementId: "G-4PP5B3C50E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
