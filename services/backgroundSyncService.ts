// services/backgroundSyncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileStorageService } from './profileStorageService';

class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
  private readonly STORAGE_KEY = 'background_sync_config';

  private constructor() {}

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  /**
   * Start the background sync service
   */
  async startBackgroundSync(token: string): Promise<void> {
    try {
      console.log('🔄 BackgroundSync: Starting background sync service');
      
      // Clear any existing interval
      this.stopBackgroundSync();
      
      // Save sync configuration
      await this.saveSyncConfig({
        isEnabled: true,
        lastSyncAttempt: new Date().toISOString(),
        token: token
      });
      
      // Perform initial sync
      await this.performSync(token);
      
      // Set up periodic sync
      this.syncInterval = setTimeout(async () => {
        await this.performSync(token);
      }, this.SYNC_INTERVAL_MS);
      
      console.log('✅ BackgroundSync: Background sync service started');
    } catch (error) {
      console.error('❌ BackgroundSync: Failed to start background sync:', error);
    }
  }

  /**
   * Stop the background sync service
   */
  async stopBackgroundSync(): Promise<void> {
    try {
      console.log('🛑 BackgroundSync: Stopping background sync service');
      
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
      
      await this.saveSyncConfig({
        isEnabled: false,
        lastSyncAttempt: new Date().toISOString(),
        token: null
      });
      
      console.log('✅ BackgroundSync: Background sync service stopped');
    } catch (error) {
      console.error('❌ BackgroundSync: Failed to stop background sync:', error);
    }
  }

  /**
   * Perform a manual sync
   */
  async performManualSync(token: string): Promise<boolean> {
    console.log('🔄 BackgroundSync: Performing manual sync');
    return await this.performSync(token);
  }

  /**
   * Check if sync is due (for UI indicators)
   */
  async isSyncDue(): Promise<boolean> {
    try {
      const syncStatus = await profileStorageService.getSyncStatus();
      if (!syncStatus.lastSyncAttempt) return true;
      
      const lastSync = new Date(syncStatus.lastSyncAttempt);
      const now = new Date();
      const daysSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSinceLastSync >= 14; // 2 weeks
    } catch (error) {
      console.error('❌ BackgroundSync: Failed to check sync status:', error);
      return true; // Default to sync due if we can't determine
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    isEnabled: boolean;
    lastSyncAttempt: string | null;
    nextSyncDue: string | null;
    daysSinceLastSync: number | null;
    hasPendingSync: boolean;
    syncStatus: 'synced' | 'pending' | 'failed' | null;
  }> {
    try {
      const config = await this.getSyncConfig();
      const syncStatus = await profileStorageService.getSyncStatus();
      
      let daysSinceLastSync = null;
      
      if (syncStatus.lastSyncAttempt) {
        const lastSync = new Date(syncStatus.lastSyncAttempt);
        const now = new Date();
        daysSinceLastSync = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      return {
        isEnabled: config.isEnabled,
        lastSyncAttempt: syncStatus.lastSyncAttempt || null,
        nextSyncDue: syncStatus.nextSyncDue || null,
        daysSinceLastSync,
        hasPendingSync: syncStatus.hasPendingSync,
        syncStatus: syncStatus.syncStatus || null
      };
    } catch (error) {
      console.error('❌ BackgroundSync: Failed to get sync stats:', error);
      return {
        isEnabled: false,
        lastSyncAttempt: null,
        nextSyncDue: null,
        daysSinceLastSync: null,
        hasPendingSync: false,
        syncStatus: null
      };
    }
  }

  /**
   * Initialize background sync on app start
   */
  async initializeOnAppStart(token: string | null): Promise<void> {
    try {
      const config = await this.getSyncConfig();
      
      if (config.isEnabled && token) {
        console.log('🚀 BackgroundSync: Initializing background sync on app start');
        await this.startBackgroundSync(token);
      } else {
        console.log('ℹ️ BackgroundSync: Background sync not enabled or no token available');
      }
    } catch (error) {
      console.error('❌ BackgroundSync: Failed to initialize on app start:', error);
    }
  }

  /**
   * Private method to perform the actual sync
   */
  private async performSync(token: string): Promise<boolean> {
    try {
      console.log('🔄 BackgroundSync: Attempting to sync profile with backend');
      
      const success = await profileStorageService.syncWithBackend(token);
      
      // Update sync configuration
      await this.saveSyncConfig({
        isEnabled: true,
        lastSyncAttempt: new Date().toISOString(),
        token: token
      });
      
      if (success) {
        console.log('✅ BackgroundSync: Profile synced successfully');
      } else {
        console.log('⚠️ BackgroundSync: Profile sync failed, will retry next cycle');
      }
      
      return success;
    } catch (error) {
      console.error('❌ BackgroundSync: Sync failed with error:', error);
      return false;
    }
  }

  /**
   * Save sync configuration to storage
   */
  private async saveSyncConfig(config: {
    isEnabled: boolean;
    lastSyncAttempt: string;
    token: string | null;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('❌ BackgroundSync: Failed to save sync config:', error);
    }
  }

  /**
   * Get sync configuration from storage
   */
  private async getSyncConfig(): Promise<{
    isEnabled: boolean;
    lastSyncAttempt: string | null;
    token: string | null;
  }> {
    try {
      const configStr = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (configStr) {
        return JSON.parse(configStr);
      }
    } catch (error) {
      console.error('❌ BackgroundSync: Failed to get sync config:', error);
    }
    
    return {
      isEnabled: false,
      lastSyncAttempt: null,
      token: null
    };
  }
}

// Export singleton instance
export const backgroundSyncService = BackgroundSyncService.getInstance();
export default backgroundSyncService;