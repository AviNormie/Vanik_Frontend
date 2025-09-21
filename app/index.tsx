// app/index.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { AsyncStorageLogger } from '../utils/asyncStorageLogger';

export default function IndexPage() {
  const { user, profile: farmerProfile, isLoading } = useAuth();

  // Log AsyncStorage data on app start
  useEffect(() => {
    const logStorageData = async () => {
      console.log('\n🔍 === ASYNCSTORAGE DEBUG START ===');
      console.log('📱 Logging all AsyncStorage data for debugging...');
      
      try {
        await AsyncStorageLogger.logAllStoredData();
        
        console.log('\n📊 Storage size information:');
        await AsyncStorageLogger.getStorageInfo();
        
        // Also log specific keys we're interested in
        console.log('\n🔑 Checking specific keys:');
        await AsyncStorageLogger.logSpecificKey('user');
        await AsyncStorageLogger.logSpecificKey('tokenData');
        await AsyncStorageLogger.logSpecificKey('userProfile');
        
      } catch (error) {
        console.error('❌ Failed to log AsyncStorage data:', error);
      }
      
      console.log('🔍 === ASYNCSTORAGE DEBUG END ===\n');
    };
    
    logStorageData();
  }, []);

  console.log('🚀 IndexPage: Rendering with state:', {
    isLoading,
    hasUser: !!user,
    userPhone: user?.phoneNumber,
    userName: user?.name,
    hasProfile: !!farmerProfile,
    profileName: farmerProfile?.farmerProfile?.name || farmerProfile?.retailerProfile?.ownerName
  });

  if (isLoading) {
    console.log('⏳ IndexPage: Still loading, showing spinner');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Redirect based on auth state
  if (!user) {
    console.log('🔐 IndexPage: No user found, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  const profileName = farmerProfile?.farmerProfile?.name || farmerProfile?.retailerProfile?.ownerName;
  if (!profileName) {
    console.log('📝 IndexPage: User exists but no profile name, redirecting to complete-profile');
    console.log('📝 IndexPage: User data:', {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      isNewUser: user.isNewUser
    });
    return <Redirect href="/(auth)/complete-profile" />;
  }

  console.log('✅ IndexPage: User and profile complete, redirecting to tabs');
  return <Redirect href="/(tabs)" />;
}
