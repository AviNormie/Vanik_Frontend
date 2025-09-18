// context/AuthContext.tsx - SIMPLIFIED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  role: string;
  isNewUser: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: User | null; // Add profile alias for compatibility
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔍 AuthContext: Loading stored authentication data...');
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      
      console.log('📱 AuthContext: Stored user exists:', !!storedUser);
      console.log('🎫 AuthContext: Stored token exists:', !!storedToken);
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 AuthContext: Parsed user data:', {
          id: parsedUser.id,
          phoneNumber: parsedUser.phoneNumber,
          name: parsedUser.name,
          isNewUser: parsedUser.isNewUser
        });
        setUser(parsedUser);
        setToken(storedToken);
        console.log('✅ AuthContext: User and token restored from storage');
      } else {
        console.log('❌ AuthContext: No stored authentication found');
      }
    } catch (error) {
      console.error('❌ AuthContext: Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
      console.log('🏁 AuthContext: Loading complete, isLoading set to false');
    }
  };

  const login = async (userData: User, authToken: string) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', authToken);
      
      setUser(userData);
      setToken(authToken);
      
      console.log('✅ User logged in and stored:', userData.phoneNumber);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Logging out user...');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      
      setUser(null);
      setToken(null);
      
      console.log('✅ AuthContext: User logged out and storage cleared');
    } catch (error) {
      console.error('❌ AuthContext: Failed to clear auth data:', error);
    }
  };

  // Add a function to clear storage for debugging
  const clearStorage = async () => {
    try {
      console.log('🧹 AuthContext: Clearing all storage for debugging...');
      await AsyncStorage.clear();
      setUser(null);
      setToken(null);
      console.log('✅ AuthContext: All storage cleared');
    } catch (error) {
      console.error('❌ AuthContext: Failed to clear storage:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    profile: user, // Add profile alias pointing to user
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
