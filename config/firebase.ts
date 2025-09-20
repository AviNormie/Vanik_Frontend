// config/firebase.ts
import { Platform } from 'react-native';

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

// Platform-specific Firebase initialization
let app: any = null;
let auth: any = null;

if (Platform.OS !== 'web') {
  // Only initialize Firebase on mobile platforms
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  
  // Initialize Firebase app only if it hasn't been initialized already
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firebase Auth
  auth = getAuth(app);
} else {
  // Mock Firebase for web platform
  console.log('🌐 Running on web - Firebase disabled');
  app = { options: firebaseConfig };
  auth = null;
}

export { auth };
export default app;
