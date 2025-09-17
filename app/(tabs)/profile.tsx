// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../components/ui/Card';

export default function ProfileScreen() {
  const { user, farmerProfile } = useAuth();

  return (
    <ScrollView className="flex-1 bg-green-50 p-6">
      <Card className="mb-6">
        <Text className="text-xl font-bold mb-4 text-gray-800">
          व्यक्तिगत जानकारी (Personal Information)
        </Text>
        
        <View className="space-y-3">
          <View>
            <Text className="text-sm text-gray-500">नाम (Name)</Text>
            <Text className="text-lg text-gray-800">
              {farmerProfile?.name || 'Not provided'}
            </Text>
          </View>
          
          <View>
            <Text className="text-sm text-gray-500">मोबाइल (Mobile)</Text>
            <Text className="text-lg text-gray-800">{user?.phone}</Text>
          </View>
          
          <View>
            <Text className="text-sm text-gray-500">गाँव (Village)</Text>
            <Text className="text-lg text-gray-800">
              {farmerProfile?.village || 'Not provided'}
            </Text>
          </View>
          
          <View>
            <Text className="text-sm text-gray-500">जिला (District)</Text>
            <Text className="text-lg text-gray-800">
              {farmerProfile?.district || 'Not provided'}
            </Text>
          </View>
          
          <View>
            <Text className="text-sm text-gray-500">राज्य (State)</Text>
            <Text className="text-lg text-gray-800">
              {farmerProfile?.state || 'Not provided'}
            </Text>
          </View>
          
          {farmerProfile?.farmSize && (
            <View>
              <Text className="text-sm text-gray-500">खेत का आकार (Farm Size)</Text>
              <Text className="text-lg text-gray-800">
                {farmerProfile.farmSize} एकड़ (Acres)
              </Text>
            </View>
          )}
        </View>
      </Card>

      <Card>
        <Text className="text-xl font-bold mb-4 text-gray-800">
          खाता जानकारी (Account Information)
        </Text>
        
        <View className="space-y-3">
          <View>
            <Text className="text-sm text-gray-500">Firebase UID</Text>
            <Text className="text-sm text-gray-800 font-mono">
              {user?.uid}
            </Text>
          </View>
          
          <View>
            <Text className="text-sm text-gray-500">सत्यापन स्थिति (Verification Status)</Text>
            <Text className="text-lg text-green-600 font-semibold">
              ✅ सत्यापित (Verified)
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
