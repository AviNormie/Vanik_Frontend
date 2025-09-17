// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../components/ui/Card';

const features = [
  { 
    title: '🌱 फसल रोग पहचान', 
    subtitle: 'Crop Disease Detection',
    description: 'AI-powered crop disease identification'
  },
  { 
    title: '🌤️ मौसम अलर्ट', 
    subtitle: 'Weather Alerts',
    description: 'Real-time weather updates and warnings'
  },
  { 
    title: '💰 बाजार भाव', 
    subtitle: 'Market Prices',
    description: 'Current crop prices and market trends'
  },
  { 
    title: '👨‍🌾 विशेषज्ञ सलाह', 
    subtitle: 'Expert Consultation',
    description: 'Connect with agricultural experts'
  }
];

export default function DashboardScreen() {
  const { user, farmerProfile } = useAuth();

  return (
    <ScrollView className="flex-1 bg-green-50">
      {/* Welcome Header */}
      <View className="bg-green-600 p-6 pb-8">
        <Text className="text-white text-2xl font-bold text-center">
          नमस्ते! {farmerProfile?.name || 'किसान जी'}
        </Text>
        <Text className="text-white text-center opacity-90 mt-1">
          {user?.phone}
        </Text>
        {farmerProfile?.village && (
          <Text className="text-white text-center mt-1">
            📍 {farmerProfile.village}
          </Text>
        )}
      </View>

      <View className="p-6 -mt-4">
        {/* Profile Summary Card */}
        <Card className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-800">
            प्रोफाइल जानकारी (Profile Info)
          </Text>
          <View className="space-y-2">
            <Text className="text-gray-600">नाम: {farmerProfile?.name || 'N/A'}</Text>
            <Text className="text-gray-600">गाँव: {farmerProfile?.village || 'N/A'}</Text>
            <Text className="text-gray-600">जिला: {farmerProfile?.district || 'N/A'}</Text>
            {farmerProfile?.farmSize && (
              <Text className="text-gray-600">
                खेत का आकार: {farmerProfile.farmSize} एकड़
              </Text>
            )}
          </View>
        </Card>

        {/* Services Section */}
        <Text className="text-xl font-bold mb-4 text-gray-800">
          🌾 उपलब्ध सेवाएं (Available Services)
        </Text>
        
        {features.map((feature, index) => (
          <TouchableOpacity key={index} className="mb-4">
            <Card>
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                {feature.title}
              </Text>
              <Text className="text-gray-600 mb-2">
                {feature.subtitle}
              </Text>
              <Text className="text-sm text-gray-500">
                {feature.description}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
