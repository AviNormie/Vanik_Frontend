// app/index.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function IndexPage() {
  const { user, profile: farmerProfile, isLoading } = useAuth();

  console.log('🚀 IndexPage: Rendering with state:', {
    isLoading,
    hasUser: !!user,
    userPhone: user?.phoneNumber,
    userName: user?.name,
    hasProfile: !!farmerProfile,
    profileName: farmerProfile?.name
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

  if (!farmerProfile?.name) {
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
