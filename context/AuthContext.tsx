// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FarmerProfile {
  firebaseUid: string;
  phoneNumber: string;
  name?: string;
  village?: string;
  district?: string;
  state?: string;
  cropTypes?: string[];
  farmSize?: number;
  language?: string;
}

interface AuthUser {
  uid: string;
  phone: string;
  verified: boolean;
  hasProfile: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  farmerProfile: FarmerProfile | null;
  isLoading: boolean;
  setFarmerProfile: (profile: FarmerProfile | null) => void;
  logout: () => Promise<void>;
  verifyWithBackend: (idToken: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  farmerProfile: null,
  isLoading: true,
  setFarmerProfile: () => {},
  logout: async () => {},
  verifyWithBackend: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);

  // Replace with your actual backend URL
  const BACKEND_URL = 'https://auth-service-sih.onrender.com'; // Update this!

  // Function to verify with backend
  const verifyWithBackend = async (idToken: string) => {
    try {
      console.log('🔍 Verifying with backend...', BACKEND_URL);
      
      const response = await fetch(`${BACKEND_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);

      if (data.success) {
        setUser({
          uid: data.user.uid,
          phone: data.user.phone,
          verified: true,
          hasProfile: data.user.hasProfile
        });

        setFarmerProfile(data.farmer);
        await AsyncStorage.setItem('firebase_token', idToken);
        
        return data;
      } else {
        throw new Error(data.message || 'Backend verification failed');
      }
    } catch (error) {
      console.error('❌ Backend verification error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      console.log('🔥 Firebase auth state changed:', !!firebaseUser);
      
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          console.log('🎫 Got Firebase ID token');
          
          // This will be called automatically when Firebase auth changes
          // But we'll also call it manually from the login screen for immediate feedback
          
        } catch (error) {
          console.error('❌ Auto-verification error:', error);
          setUser(null);
          setFarmerProfile(null);
        }
      } else {
        setUser(null);
        setFarmerProfile(null);
        await AsyncStorage.removeItem('firebase_token');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFarmerProfile(null);
      await AsyncStorage.removeItem('firebase_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    farmerProfile,
    isLoading,
    setFarmerProfile,
    logout,
    verifyWithBackend
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
