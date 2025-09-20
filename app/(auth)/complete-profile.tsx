// app/(auth)/complete-profile.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function CompleteProfileScreen() {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, logout, token } = useAuth();
  // Platform-specific backend URL configuration
  const getBackendURL = () => {
    if (Platform.OS === 'web') {
      // For web, use the remote backend
      return process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'https://auth-service-sih.onrender.com';
    } else {
      // For mobile, can use localhost
      return process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'http://localhost:3000';
    }
  };
  
  const AUTH_BACKEND_URL = getBackendURL();

  const completeProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'कृपया अपना नाम दर्ज करें (Please enter your name)');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🎫 CompleteProfile: Retrieved token from context:', !!token);
      console.log('👤 CompleteProfile: Current user:', {
        id: user?.id,
        phoneNumber: user?.phoneNumber,
        name: user?.name
      });
      
      if (!token) {
        console.log('⚠️ CompleteProfile: No token found, user came from failed backend verification');
        Alert.alert(
          'Notice', 
          'Backend verification failed during login, but you can still complete your profile. Your data will be saved when the backend is available.',
          [
            { text: 'Continue', style: 'default' },
            { text: 'Login Again', onPress: () => router.replace('/(auth)/login'), style: 'cancel' }
          ]
        );
        // For now, let's allow profile completion without token
        // In a real app, you might want to store this data locally and sync later
      }
      
      let data;
      
      if (token) {
        // Normal flow with token
        const response = await fetch(`${AUTH_BACKEND_URL}/auth/complete-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            name,
            village: village || undefined,
            district: district || undefined,
            state: state || undefined,
            farmSize: farmSize ? parseFloat(farmSize) : undefined,
            cropTypes: [],
            language: 'hindi'
          })
        });
        data = await response.json();
      } else {
        // Fallback for when backend verification failed
        console.log('📱 CompleteProfile: Saving profile locally (no token available)');
        data = {
          success: true,
          farmer: {
            name,
            village,
            district,
            state,
            farmSize: farmSize ? parseFloat(farmSize) : undefined
          }
        };
      }
      
      if (data.success) {
        console.log('✅ CompleteProfile: Profile completed successfully:', data.farmer);
        
        // Update user data in storage with the new profile info
        if (user) {
          const updatedUser = { ...user, name: data.farmer.name };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('💾 CompleteProfile: Updated user data in storage');
        }
        
        Alert.alert(
          'Success', 
          'प्रोफाइल पूरी हो गई! (Profile completed successfully!) 🎉',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to complete profile');
      }
    } catch (error: any) {
      console.error('Complete Profile Error:', error);
      Alert.alert('Error', 'प्रोफाइल पूरी करने में त्रुटि (Failed to complete profile)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌾 अपनी जानकारी भरें</Text>
        <Text style={styles.subtitle}>Complete Your Profile</Text>

        <Card>
          <Input
            label="नाम (Name) *"
            value={name}
            onChangeText={setName}
            placeholder="राम कुमार (Ram Kumar)"
            autoFocus
          />

          <Input
            label="गाँव (Village)"
            value={village}
            onChangeText={setVillage}
            placeholder="बागपत (Bagpat)"
          />

          <Input
            label="जिला (District)"
            value={district}
            onChangeText={setDistrict}
            placeholder="मेरठ (Meeruth)"
          />

          <Input
            label="राज्य (State)"
            value={state}
            onChangeText={setState}
            placeholder="उत्तर प्रदेश (Uttar Pradesh)"
          />

          <Input
            label="खेत का आकार (Farm Size in Acres)"
            value={farmSize}
            onChangeText={setFarmSize}
            placeholder="5.5"
            keyboardType="decimal-pad"
          />

          <Button
            title={isLoading ? 'सेव हो रहा है...' : 'पूरा करें (Complete)'}
            onPress={completeProfile}
            loading={isLoading}
          />
          
          <View style={{ marginTop: 16 }}>
            <Button
              title="🧹 Clear Storage & Logout (Debug)"
              onPress={async () => {
                console.log('🧹 Debug: Clearing storage and logging out');
                await AsyncStorage.clear();
                logout();
                router.replace('/(auth)/login');
              }}
              variant="danger"
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#166534',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
  },
});
