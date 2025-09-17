// app/(tabs)/settings.tsx
import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'लॉगआउट (Logout)',
      'क्या आप वाकई लॉगआउट करना चाहते हैं? (Are you sure you want to logout?)',
      [
        { text: 'रद्द करें (Cancel)', style: 'cancel' },
        {
          text: 'हाँ (Yes)',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'लॉगआउट में त्रुटि (Failed to logout)');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-green-50 p-6">
      <Card className="mb-6">
        <Text className="text-xl font-bold mb-4 text-gray-800">
          ऐप सेटिंग्स (App Settings)
        </Text>
        
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700">भाषा (Language)</Text>
            <Text className="text-gray-500">हिंदी/English</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700">सूचनाएं (Notifications)</Text>
            <Text className="text-green-600">चालू (On)</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700">ऐप वर्जन (App Version)</Text>
            <Text className="text-gray-500">1.0.0</Text>
          </View>
        </View>
      </Card>

      <Card className="mb-6">
        <Text className="text-xl font-bold mb-4 text-gray-800">
          सहायता (Support)
        </Text>
        
        <View className="space-y-3">
          <Text className="text-gray-600">• हेल्पलाइन: 1800-XXX-XXXX</Text>
          <Text className="text-gray-600">• ईमेल: support@agrotech.com</Text>
          <Text className="text-gray-600">• सप्ताह के सभी दिन उपलब्ध</Text>
        </View>
      </Card>

      <Button
        title="लॉगआउट (Logout)"
        onPress={handleLogout}
        variant="danger"
      />
    </ScrollView>
  );
}
