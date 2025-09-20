// services/profileStorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface FarmerProfile {
  name: string;
  village: string;
  district: string;
  state: string;
  farmSize: string;
  cropTypes: string;
  experience: string;
  landOwnership: 'OWNED' | 'LEASED' | 'SHARED';
  irrigationType: 'RAIN_FED' | 'IRRIGATED' | 'MIXED';
  language: 'hindi' | 'english';
  lastUpdated: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface RetailerProfile {
  businessName: string;
  ownerName: string;
  businessType: 'WHOLESALE' | 'RETAIL' | 'BOTH';
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  licenseNumber: string;
  experience: string;
  specialization: string;
  language: 'hindi' | 'english';
  lastUpdated: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  role: 'FARMER' | 'RETAILER';
  farmerProfile?: FarmerProfile;
  retailerProfile?: RetailerProfile;
  lastSyncAttempt?: string;
  nextSyncDue?: string;
}

class ProfileStorageService {
  private static readonly PROFILE_KEY = 'user_complete_profile';
  private static readonly SYNC_INTERVAL_DAYS = 14; // 2 weeks

  // Platform-specific backend URL configuration
  private getBackendURL(): string {
    if (Platform.OS === 'web') {
      return process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'https://auth-service-sih.onrender.com';
    } else {
      return process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'http://localhost:3000';
    }
  }

  /**
   * Save complete profile data to AsyncStorage
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      console.log('💾 ProfileStorage: Saving complete profile for user:', profile.id);
      
      // Add metadata
      const profileWithMetadata = {
        ...profile,
        lastUpdated: new Date().toISOString(),
        nextSyncDue: this.calculateNextSyncDate(),
      };

      // Update the specific profile section with sync status
      if (profile.role === 'FARMER' && profile.farmerProfile) {
        profileWithMetadata.farmerProfile = {
          ...profile.farmerProfile,
          lastUpdated: new Date().toISOString(),
          syncStatus: 'pending' as const,
        };
      } else if (profile.role === 'RETAILER' && profile.retailerProfile) {
        profileWithMetadata.retailerProfile = {
          ...profile.retailerProfile,
          lastUpdated: new Date().toISOString(),
          syncStatus: 'pending' as const,
        };
      }

      await AsyncStorage.setItem(ProfileStorageService.PROFILE_KEY, JSON.stringify(profileWithMetadata));
      console.log('✅ ProfileStorage: Profile saved successfully');
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to save profile:', error);
      throw error;
    }
  }

  /**
   * Load complete profile data from AsyncStorage
   */
  async loadProfile(): Promise<UserProfile | null> {
    try {
      console.log('🔍 ProfileStorage: Loading complete profile from storage');
      const storedProfile = await AsyncStorage.getItem(ProfileStorageService.PROFILE_KEY);
      
      if (!storedProfile) {
        console.log('📱 ProfileStorage: No stored profile found');
        return null;
      }

      const profile: UserProfile = JSON.parse(storedProfile);
      console.log('✅ ProfileStorage: Profile loaded successfully for user:', profile.id);
      return profile;
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to load profile:', error);
      return null;
    }
  }

  /**
   * Update farmer profile data
   */
  async updateFarmerProfile(userId: string, farmerData: Omit<FarmerProfile, 'lastUpdated' | 'syncStatus'>): Promise<void> {
    try {
      const existingProfile = await this.loadProfile();
      
      const updatedProfile: UserProfile = {
        id: userId,
        phoneNumber: existingProfile?.phoneNumber || '',
        role: 'FARMER',
        farmerProfile: {
          ...farmerData,
          lastUpdated: new Date().toISOString(),
          syncStatus: 'pending',
        },
        lastSyncAttempt: existingProfile?.lastSyncAttempt,
        nextSyncDue: this.calculateNextSyncDate(),
      };

      await this.saveProfile(updatedProfile);
      console.log('✅ ProfileStorage: Farmer profile updated successfully');
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to update farmer profile:', error);
      throw error;
    }
  }

  /**
   * Update retailer profile data
   */
  async updateRetailerProfile(userId: string, retailerData: Omit<RetailerProfile, 'lastUpdated' | 'syncStatus'>): Promise<void> {
    try {
      const existingProfile = await this.loadProfile();
      
      const updatedProfile: UserProfile = {
        id: userId,
        phoneNumber: existingProfile?.phoneNumber || '',
        role: 'RETAILER',
        retailerProfile: {
          ...retailerData,
          lastUpdated: new Date().toISOString(),
          syncStatus: 'pending',
        },
        lastSyncAttempt: existingProfile?.lastSyncAttempt,
        nextSyncDue: this.calculateNextSyncDate(),
      };

      await this.saveProfile(updatedProfile);
      console.log('✅ ProfileStorage: Retailer profile updated successfully');
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to update retailer profile:', error);
      throw error;
    }
  }

  /**
   * Check if profile sync is due
   */
  async isSyncDue(): Promise<boolean> {
    try {
      const profile = await this.loadProfile();
      if (!profile || !profile.nextSyncDue) {
        return true; // If no sync date, sync is due
      }

      const nextSyncDate = new Date(profile.nextSyncDue);
      const now = new Date();
      
      return now >= nextSyncDate;
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to check sync status:', error);
      return true; // Default to sync due on error
    }
  }

  /**
   * Sync profile with backend
   */
  async syncWithBackend(token: string): Promise<boolean> {
    try {
      const profile = await this.loadProfile();
      if (!profile) {
        console.log('📱 ProfileStorage: No profile to sync');
        return false;
      }

      console.log('🌐 ProfileStorage: Starting profile sync with backend');
      const backendUrl = this.getBackendURL();

      // Prepare sync payload based on role
      let syncPayload: any = {
        token,
        role: profile.role,
      };

      if (profile.role === 'FARMER' && profile.farmerProfile) {
        syncPayload = {
          ...syncPayload,
          name: profile.farmerProfile.name,
          village: profile.farmerProfile.village,
          district: profile.farmerProfile.district,
          state: profile.farmerProfile.state,
          farmSize: profile.farmerProfile.farmSize ? parseFloat(profile.farmerProfile.farmSize) : undefined,
          cropTypes: profile.farmerProfile.cropTypes.split(',').map(crop => crop.trim()),
          language: profile.farmerProfile.language,
          experience: profile.farmerProfile.experience,
          landOwnership: profile.farmerProfile.landOwnership,
          irrigationType: profile.farmerProfile.irrigationType,
        };
      } else if (profile.role === 'RETAILER' && profile.retailerProfile) {
        syncPayload = {
          ...syncPayload,
          businessName: profile.retailerProfile.businessName,
          ownerName: profile.retailerProfile.ownerName,
          businessType: profile.retailerProfile.businessType,
          address: profile.retailerProfile.address,
          city: profile.retailerProfile.city,
          state: profile.retailerProfile.state,
          pincode: profile.retailerProfile.pincode,
          gstNumber: profile.retailerProfile.gstNumber,
          licenseNumber: profile.retailerProfile.licenseNumber,
          language: profile.retailerProfile.language,
          experience: profile.retailerProfile.experience,
          specialization: profile.retailerProfile.specialization,
        };
      }

      const response = await fetch(`${backendUrl}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncPayload),
      });

      const result = await response.json();

      if (result.success) {
        // Update sync status
        const updatedProfile = { ...profile };
        updatedProfile.lastSyncAttempt = new Date().toISOString();
        updatedProfile.nextSyncDue = this.calculateNextSyncDate();

        if (profile.role === 'FARMER' && updatedProfile.farmerProfile) {
          updatedProfile.farmerProfile.syncStatus = 'synced';
        } else if (profile.role === 'RETAILER' && updatedProfile.retailerProfile) {
          updatedProfile.retailerProfile.syncStatus = 'synced';
        }

        await this.saveProfile(updatedProfile);
        console.log('✅ ProfileStorage: Profile synced successfully with backend');
        return true;
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to sync with backend:', error);
      
      // Update sync status to failed
      const profile = await this.loadProfile();
      if (profile) {
        profile.lastSyncAttempt = new Date().toISOString();
        if (profile.role === 'FARMER' && profile.farmerProfile) {
          profile.farmerProfile.syncStatus = 'failed';
        } else if (profile.role === 'RETAILER' && profile.retailerProfile) {
          profile.retailerProfile.syncStatus = 'failed';
        }
        await this.saveProfile(profile);
      }
      
      return false;
    }
  }

  /**
   * Fetch latest profile from backend
   */
  async fetchProfileFromBackend(userId: string, token: string): Promise<UserProfile | null> {
    try {
      console.log('🌐 ProfileStorage: Fetching profile from backend for user:', userId);
      const backendUrl = this.getBackendURL();

      const response = await fetch(`${backendUrl}/auth/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.user) {
        // Transform backend response to our profile format
        const backendProfile: UserProfile = {
          id: result.user.id,
          phoneNumber: result.user.phoneNumber,
          role: result.user.role,
        };

        if (result.user.role === 'FARMER' && result.user.farmerProfile) {
          backendProfile.farmerProfile = {
            ...result.user.farmerProfile,
            lastUpdated: new Date().toISOString(),
            syncStatus: 'synced' as const,
          };
        } else if (result.user.role === 'RETAILER' && result.user.retailerProfile) {
          backendProfile.retailerProfile = {
            ...result.user.retailerProfile,
            lastUpdated: new Date().toISOString(),
            syncStatus: 'synced' as const,
          };
        }

        console.log('✅ ProfileStorage: Profile fetched successfully from backend');
        return backendProfile;
      } else {
        console.log('📱 ProfileStorage: No profile found on backend');
        return null;
      }
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to fetch profile from backend:', error);
      return null;
    }
  }

  /**
   * Clear all profile data
   */
  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ProfileStorageService.PROFILE_KEY);
      console.log('🧹 ProfileStorage: Profile data cleared');
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to clear profile:', error);
      throw error;
    }
  }

  /**
   * Get sync status summary
   */
  async getSyncStatus(): Promise<{
    hasPendingSync: boolean;
    lastSyncAttempt?: string;
    nextSyncDue?: string;
    syncStatus?: 'synced' | 'pending' | 'failed';
  }> {
    try {
      const profile = await this.loadProfile();
      if (!profile) {
        return { hasPendingSync: false };
      }

      const profileData = profile.role === 'FARMER' ? profile.farmerProfile : profile.retailerProfile;
      
      return {
        hasPendingSync: await this.isSyncDue(),
        lastSyncAttempt: profile.lastSyncAttempt,
        nextSyncDue: profile.nextSyncDue,
        syncStatus: profileData?.syncStatus,
      };
    } catch (error) {
      console.error('❌ ProfileStorage: Failed to get sync status:', error);
      return { hasPendingSync: true };
    }
  }

  /**
   * Calculate next sync date (2 weeks from now)
   */
  private calculateNextSyncDate(): string {
    const nextSync = new Date();
    nextSync.setDate(nextSync.getDate() + ProfileStorageService.SYNC_INTERVAL_DAYS);
    return nextSync.toISOString();
  }
}

export const profileStorageService = new ProfileStorageService();
export default profileStorageService;