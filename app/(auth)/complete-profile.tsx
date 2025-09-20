// app/(auth)/complete-profile.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import LogoutButton from '../../components/shared/LogoutButton';
import RoleSelector from '../../components/auth/RoleSelector';
import FarmerForm, { FarmerFormData } from '../../components/auth/FarmerForm';
import RetailerForm, { RetailerFormData } from '../../components/auth/RetailerForm';

export default function CompleteProfileScreen() {
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'RETAILER'>('FARMER');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, logout, token } = useAuth();
  const AUTH_BACKEND_URL = process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'https://auth-service-sih.onrender.com';

  console.log('🏗️ CompleteProfile: Component initialized with role:', selectedRole);
  console.log('🔧 CompleteProfile: AUTH_BACKEND_URL configured as:', AUTH_BACKEND_URL);
  console.log('🔧 CompleteProfile: EXPO_PUBLIC_AUTH_BACKEND_URL env var:', process.env.EXPO_PUBLIC_AUTH_BACKEND_URL);
  console.log('👤 CompleteProfile: Current user context:', {
    userId: user?.id,
    phoneNumber: user?.phoneNumber,
    hasToken: !!token
  });

  const handleRoleChange = (role: 'FARMER' | 'RETAILER') => {
    console.log('🔄 CompleteProfile: Role changed from', selectedRole, 'to', role);
    setSelectedRole(role);
  };

  const handleFarmerSubmit = async (formData: FarmerFormData) => {
    console.log('🌾 CompleteProfile: Submitting farmer data:', formData);
    await submitProfile('FARMER', formData);
  };

  const handleRetailerSubmit = async (formData: RetailerFormData) => {
    console.log('🏪 CompleteProfile: Submitting retailer data:', formData);
    await submitProfile('RETAILER', formData);
  };

  const submitProfile = async (role: 'FARMER' | 'RETAILER', formData: FarmerFormData | RetailerFormData) => {
    setIsLoading(true);

    try {
      console.log('🎫 CompleteProfile: Retrieved token from context:', !!token);
      console.log('🎫 CompleteProfile: Token value (first 50 chars):', token ? token.substring(0, 50) : 'null');
      
      // Also check AsyncStorage directly
      const storedTokenData = await AsyncStorage.getItem('tokenData');
      console.log('💾 CompleteProfile: Direct AsyncStorage token check:', !!storedTokenData);
      if (storedTokenData) {
        const parsedTokenData = JSON.parse(storedTokenData);
        console.log('💾 CompleteProfile: Stored token (first 50 chars):', parsedTokenData.token ? parsedTokenData.token.substring(0, 50) : 'null');
      }
      
      console.log('👤 CompleteProfile: Current user:', {
        id: user?.id,
        phoneNumber: user?.phoneNumber,
        name: user?.name
      });
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        router.replace('/(auth)/login');
        return;
      }
      
      // Map form data to backend expected format
      let mappedData: any = { ...formData };
      
      // For retailers, map ownerName to name field that backend expects
      if (role === 'RETAILER' && 'ownerName' in formData) {
        const retailerData = formData as RetailerFormData;
        mappedData.name = retailerData.ownerName;
        delete mappedData.ownerName; // Remove the original field
      }
      
      const payload = {
        token, // Include token in request body
        role,
        ...mappedData,
        userId: user?.id,
        phoneNumber: user?.phoneNumber
      };
      
      console.log('📤 CompleteProfile: Sending payload to backend:', payload);
      console.log('🎫 CompleteProfile: Using token in request body:', token ? `${token.substring(0, 20)}...` : 'null');
      
      const response = await fetch(`${AUTH_BACKEND_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 CompleteProfile: Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CompleteProfile: Backend error response:', errorText);
        throw new Error(`Backend responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ CompleteProfile: Profile completed successfully:', data);
      
      // Update user data in storage with the new profile info
      if (user && data.user) {
        const updatedUser = { ...user, ...data.user, role };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('💾 CompleteProfile: Updated user data in storage with role:', role);
      }
      
      Alert.alert(
        'Success', 
        `${role === 'FARMER' ? '🌾 किसान' : '🏪 व्यापारी'} प्रोफाइल पूरी हो गई! (Profile completed successfully!) 🎉`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
      
    } catch (error: any) {
      console.error('❌ CompleteProfile: Error:', error);
      Alert.alert('Error', `प्रोफाइल पूरी करने में त्रुटि (Failed to complete profile): ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌾 अपनी जानकारी भरें</Text>
        <Text style={styles.subtitle}>Complete Your Profile</Text>

        <View style={styles.roleSelectorContainer}>
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
          />
        </View>

        {selectedRole === 'FARMER' ? (
          <FarmerForm
            onSubmit={handleFarmerSubmit}
            isLoading={isLoading}
          />
        ) : (
          <RetailerForm
            onSubmit={handleRetailerSubmit}
            isLoading={isLoading}
          />
        )}
        
        <View style={styles.debugContainer}>
          <LogoutButton
            title="🧹 Clear Storage & Logout (Debug)"
            variant="danger"
            showConfirmation={false}
          />
        </View>
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
  roleSelectorContainer: {
    marginBottom: 24,
  },
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});
