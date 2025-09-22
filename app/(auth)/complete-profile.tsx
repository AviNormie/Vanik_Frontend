// app/(auth)/complete-profile.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import FarmerForm, { FarmerFormData } from '../../components/auth/FarmerForm';
import RetailerForm, { RetailerFormData } from '../../components/auth/RetailerForm';
import RoleSelector, { UserRole } from '../../components/auth/RoleSelector';

export default function CompleteProfileScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, logout, token, updateFarmerProfile, updateRetailerProfile, syncProfile } = useAuth();

  const handleFarmerSubmit = async (farmerData: FarmerFormData) => {
    setIsLoading(true);
    try {
      console.log('🚀 Submitting farmer profile:', farmerData);
      
      await updateFarmerProfile(farmerData);
      
      // Try to sync with backend
      const syncSuccess = await syncProfile();
      
      if (syncSuccess) {
        Alert.alert('Success', 'Farmer profile completed and synced successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert(
          'Profile Saved Locally', 
          'Your farmer profile has been saved locally and will sync when connection is restored.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      }
    } catch (error) {
      console.error('❌ Failed to save farmer profile:', error);
      Alert.alert('Error', 'Failed to save farmer profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetailerSubmit = async (retailerData: RetailerFormData) => {
    setIsLoading(true);
    try {
      console.log('🚀 Submitting retailer profile:', retailerData);
      
      await updateRetailerProfile(retailerData);
      
      // Try to sync with backend
      const syncSuccess = await syncProfile();
      
      if (syncSuccess) {
        Alert.alert('Success', 'Retailer profile completed and synced successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert(
          'Profile Saved Locally', 
          'Your retailer profile has been saved locally and will sync when connection is restored.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      }
    } catch (error) {
      console.error('❌ Failed to save retailer profile:', error);
      Alert.alert('Error', 'Failed to save retailer profile. Please try again.');
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
          <RoleSelector
             selectedRole={selectedRole}
             onRoleChange={setSelectedRole}
           />
           
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
          
          <View style={{ marginTop: 16 }}>
            
            <View style={{ marginTop: 2 }}>
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
