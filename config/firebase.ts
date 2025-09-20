// config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC4cG0yHQjS_t2Q4CnN-lCuwFJre8lmVLk",
  authDomain: "campus-cupid-multiverse.firebaseapp.com",
  projectId: "campus-cupid-multiverse",
  storageBucket: "campus-cupid-multiverse.firebasestorage.app",
  messagingSenderId: "771431869817",
  appId: "1:771431869817:web:031eec4c6afe16523213a8",
  measurementId: "G-N993ZJWKBZ"
};

// Initialize Firebase app only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
