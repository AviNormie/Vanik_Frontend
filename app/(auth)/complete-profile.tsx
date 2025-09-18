// app/(auth)/complete-profile.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
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
  
  const { setFarmerProfile } = useAuth();
  const BACKEND_URL = process.env.BACKEND_URL; // Replace with your actual IP

  const completeProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'कृपया अपना नाम दर्ज करें (Please enter your name)');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('firebase_token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          village: village || undefined,
          district: district || undefined,
          state: state || undefined,
          farmSize: farmSize ? parseFloat(farmSize) : undefined,
          cropTypes: [],
          language: 'hindi'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFarmerProfile(data.farmer);
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
