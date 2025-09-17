// app/index.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function IndexPage() {
  const { user, farmerProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Redirect based on auth state
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!farmerProfile?.name) {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  return <Redirect href="/(tabs)" />;
}
