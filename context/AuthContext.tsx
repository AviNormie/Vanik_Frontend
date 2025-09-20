// context/AuthContext.tsx - Enhanced with Profile Storage
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileStorageService, { UserProfile, FarmerProfile, RetailerProfile } from '../services/profileStorageService';
import { backgroundSyncService } from '../services/backgroundSyncService';

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
  profile: UserProfile | null;
  farmerProfile: FarmerProfile | null;
  retailerProfile: RetailerProfile | null;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateFarmerProfile: (farmerData: Omit<FarmerProfile, 'lastUpdated' | 'syncStatus'>) => Promise<void>;
  updateRetailerProfile: (retailerData: Omit<RetailerProfile, 'lastUpdated' | 'syncStatus'>) => Promise<void>;
  syncProfile: () => Promise<boolean>;
  getSyncStatus: () => Promise<any>;
  isLoading: boolean;
  isSyncDue: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncDue, setIsSyncDue] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔍 AuthContext: Loading stored authentication data...');
      const storedUser = await AsyncStorage.getItem('user');
      const storedTokenData = await AsyncStorage.getItem('tokenData');
      
      console.log('📱 AuthContext: Stored user exists:', !!storedUser);
      console.log('🎫 AuthContext: Stored token exists:', !!storedTokenData);
      
      // Load profile data
      const storedProfile = await profileStorageService.loadProfile();
      if (storedProfile) {
        setProfile(storedProfile);
        console.log('✅ AuthContext: Profile loaded from storage');
        
        // Check if sync is due
        const syncDue = await profileStorageService.isSyncDue();
        setIsSyncDue(syncDue);
      }
      
      if (storedUser && storedTokenData) {
        const parsedUser = JSON.parse(storedUser);
        const parsedTokenData = JSON.parse(storedTokenData);
        
        // Check if token has expired
        const now = new Date();
        const expirationDate = new Date(parsedTokenData.expiresAt);
        
        if (now > expirationDate) {
          console.log('⏰ AuthContext: Token has expired, clearing storage');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('tokenData');
          console.log('❌ AuthContext: Expired authentication cleared');
        } else {
          console.log('👤 AuthContext: Parsed user data:', {
            id: parsedUser.id,
            phoneNumber: parsedUser.phoneNumber,
            name: parsedUser.name,
            isNewUser: parsedUser.isNewUser
          });
          console.log('⏰ AuthContext: Token expires at:', expirationDate.toISOString());
          setUser(parsedUser);
          setToken(parsedTokenData.token);
          
          // Initialize background sync service if user is logged in
          await backgroundSyncService.initializeOnAppStart(parsedTokenData.token);
          
          console.log('✅ AuthContext: User and token restored from storage');
        }
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
      // Set token expiration to 30 days from now
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      const tokenData = {
        token: authToken,
        expiresAt: expirationDate.toISOString()
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('tokenData', JSON.stringify(tokenData));
      
      setUser(userData);
      setToken(authToken);
      
      // Start background sync service
      await backgroundSyncService.startBackgroundSync(authToken);
      
      console.log('✅ User logged in and stored with 30-day expiration:', userData.phoneNumber);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Logging out user...');
      
      // Stop background sync service
      await backgroundSyncService.stopBackgroundSync();
      
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('tokenData');
      // Also remove old token format for backward compatibility
      await AsyncStorage.removeItem('token');
      
      setUser(null);
      setToken(null);
      setProfile(null);
      setIsSyncDue(false);
      
      console.log('✅ AuthContext: User logged out and storage cleared');
    } catch (error) {
      console.error('❌ AuthContext: Failed to clear auth data:', error);
    }
  };

  // Profile management functions
  const updateFarmerProfile = async (farmerData: Omit<FarmerProfile, 'lastUpdated' | 'syncStatus'>) => {
    try {
      if (!user?.id) throw new Error('No user ID available');
      
      await profileStorageService.updateFarmerProfile(user.id, farmerData);
      const updatedProfile = await profileStorageService.loadProfile();
      setProfile(updatedProfile);
      
      console.log('✅ AuthContext: Farmer profile updated');
    } catch (error) {
      console.error('❌ AuthContext: Failed to update farmer profile:', error);
      throw error;
    }
  };

  const updateRetailerProfile = async (retailerData: Omit<RetailerProfile, 'lastUpdated' | 'syncStatus'>) => {
    try {
      if (!user?.id) throw new Error('No user ID available');
      
      await profileStorageService.updateRetailerProfile(user.id, retailerData);
      const updatedProfile = await profileStorageService.loadProfile();
      setProfile(updatedProfile);
      
      console.log('✅ AuthContext: Retailer profile updated');
    } catch (error) {
      console.error('❌ AuthContext: Failed to update retailer profile:', error);
      throw error;
    }
  };

  const syncProfile = async (): Promise<boolean> => {
    try {
      if (!token) {
        console.log('⚠️ AuthContext: No token available for sync');
        return false;
      }
      
      const success = await profileStorageService.syncWithBackend(token);
      if (success) {
        const updatedProfile = await profileStorageService.loadProfile();
        setProfile(updatedProfile);
        setIsSyncDue(false);
        console.log('✅ AuthContext: Profile synced successfully');
      }
      
      return success;
    } catch (error) {
      console.error('❌ AuthContext: Failed to sync profile:', error);
      return false;
    }
  };

  const getSyncStatus = async () => {
    return await profileStorageService.getSyncStatus();
  };

  // Add a function to clear storage for debugging
  const clearStorage = async () => {
    try {
      console.log('🧹 AuthContext: Clearing all storage for debugging...');
      await AsyncStorage.clear();
      await profileStorageService.clearProfile();
      setUser(null);
      setToken(null);
      setProfile(null);
      setIsSyncDue(false);
      console.log('✅ AuthContext: All storage cleared');
    } catch (error) {
      console.error('❌ AuthContext: Failed to clear storage:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    profile,
    farmerProfile: profile?.farmerProfile || null,
    retailerProfile: profile?.retailerProfile || null,
    login,
    logout,
    updateFarmerProfile,
    updateRetailerProfile,
    syncProfile,
    getSyncStatus,
    isLoading,
    isSyncDue,
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
