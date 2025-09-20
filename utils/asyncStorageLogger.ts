// utils/asyncStorageLogger.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility to log all AsyncStorage data for debugging purposes
 */
export class AsyncStorageLogger {
  /**
   * Log all stored data in AsyncStorage
   */
  static async logAllStoredData(): Promise<void> {
    try {
      console.log('📦 AsyncStorage Logger: Starting to log all stored data...');
      
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      if (keys.length === 0) {
        console.log('📦 AsyncStorage: No data found in storage');
        return;
      }
      
      console.log(`📦 AsyncStorage: Found ${keys.length} keys:`, keys);
      
      // Get all values
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      
      console.log('📦 AsyncStorage: Complete storage contents:');
      console.log('=' .repeat(50));
      
      keyValuePairs.forEach(([key, value]) => {
        console.log(`🔑 Key: ${key}`);
        
        if (value) {
          try {
            // Try to parse as JSON for better readability
            const parsedValue = JSON.parse(value);
            console.log(`📄 Value (parsed):`, JSON.stringify(parsedValue, null, 2));
          } catch {
            // If not JSON, log as string
            console.log(`📄 Value (raw):`, value);
          }
        } else {
          console.log(`📄 Value: null`);
        }
        
        console.log('-'.repeat(30));
      });
      
      console.log('=' .repeat(50));
      console.log('📦 AsyncStorage Logger: Finished logging all stored data');
      
    } catch (error) {
      console.error('❌ AsyncStorage Logger: Failed to log stored data:', error);
    }
  }
  
  /**
   * Log specific key from AsyncStorage
   */
  static async logSpecificKey(key: string): Promise<void> {
    try {
      console.log(`🔍 AsyncStorage Logger: Looking for key '${key}'...`);
      
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        console.log(`🔍 AsyncStorage: Key '${key}' not found`);
        return;
      }
      
      console.log(`🔑 Key: ${key}`);
      
      try {
        const parsedValue = JSON.parse(value);
        console.log(`📄 Value (parsed):`, JSON.stringify(parsedValue, null, 2));
      } catch {
        console.log(`📄 Value (raw):`, value);
      }
      
    } catch (error) {
      console.error(`❌ AsyncStorage Logger: Failed to log key '${key}':`, error);
    }
  }
  
  /**
   * Get storage size information
   */
  static async getStorageInfo(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      const keyInfo: Array<{key: string, size: number}> = [];
      
      keyValuePairs.forEach(([key, value]) => {
        const size = value ? new Blob([value]).size : 0;
        totalSize += size;
        keyInfo.push({ key, size });
      });
      
      console.log('📊 AsyncStorage Info:');
      console.log(`📦 Total keys: ${keys.length}`);
      console.log(`📏 Total size: ${totalSize} bytes (${(totalSize / 1024).toFixed(2)} KB)`);
      
      console.log('📋 Size breakdown:');
      keyInfo
        .sort((a, b) => b.size - a.size)
        .forEach(({ key, size }) => {
          console.log(`  ${key}: ${size} bytes`);
        });
        
    } catch (error) {
      console.error('❌ AsyncStorage Logger: Failed to get storage info:', error);
    }
  }
  
  /**
   * Clear all AsyncStorage data (use with caution!)
   */
  static async clearAllData(): Promise<void> {
    try {
      console.log('🧹 AsyncStorage Logger: Clearing all data...');
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage Logger: All data cleared');
    } catch (error) {
      console.error('❌ AsyncStorage Logger: Failed to clear data:', error);
    }
  }
}

// Export convenience functions
export const logAllAsyncStorage = AsyncStorageLogger.logAllStoredData;
export const logAsyncStorageKey = AsyncStorageLogger.logSpecificKey;
export const getAsyncStorageInfo = AsyncStorageLogger.getStorageInfo;
export const clearAsyncStorage = AsyncStorageLogger.clearAllData;

// Auto-log on import in development
if (__DEV__) {
  // Uncomment the line below to auto-log storage on app start
  // AsyncStorageLogger.logAllStoredData();
}