// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export default app;
