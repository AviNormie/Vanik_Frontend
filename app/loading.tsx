// app/loading.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-green-50">
      <Text className="text-4xl mb-4">🌾</Text>
      <ActivityIndicator size="large" color="#16a34a" />
      <Text className="text-lg text-gray-600 mt-4">Loading...</Text>
    </View>
  );
}
