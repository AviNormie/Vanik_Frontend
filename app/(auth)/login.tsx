// app/(auth)/login.tsx - OTP BACKEND VERSION
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const BASE_URL = 'https://auth-service-sih.onrender.com';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = `+91${phoneNumber}`;
      console.log('📱 Sending OTP to:', formattedPhone);
      
      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send OTP: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ OTP sent successfully:', result);
      
      setIsCodeSent(true);
      Alert.alert('Success', '📱 OTP sent! Check your backend logs or use test OTP: 123456 for testing.');
      
    } catch (error: any) {
      console.error('❌ Send OTP Error:', error);
      Alert.alert('Error', `Failed to send OTP: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = `+91${phoneNumber}`;
      console.log('🔍 Verifying OTP with backend...', BASE_URL);
      
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          otp: verificationCode,
          name: null, // Will be set in profile completion
          languagePref: 'hi-IN',
          location: null,
        }),
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response URL:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Backend verification success:', result);

      if (result.success) {
        // Store user data in auth context
        await login(result.user, result.session.token);
        
        Alert.alert('Success', '🎉 Login successful!');
        
        // Navigate based on profile completion
        if (result.user.isNewUser || !result.user.name) {
          console.log('👤 Profile incomplete, navigating to complete-profile');
          router.replace('/(auth)/complete-profile');
        } else {
          console.log('✅ Profile complete, navigating to dashboard');
          router.replace('/(tabs)');
        }
      } else {
        throw new Error(result.message || 'Verification failed');
      }
      
    } catch (error: any) {
      console.error('❌ Backend verification error:', error);
      Alert.alert(
        'Verification Failed', 
        `${error.message}\n\nPlease check the OTP and try again.`,
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              setVerificationCode('');
            }
          },
          {
            text: 'Get New OTP',
            onPress: resetToPhoneInput
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetToPhoneInput = () => {
    setIsCodeSent(false);
    setVerificationCode('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🌾</Text>
        <Text style={styles.title}>किसान लॉगिन</Text>
        <Text style={styles.subtitle}>Farmer Login</Text>

        <Card>
          {!isCodeSent ? (
            <View>
              <Input
                label="मोबाइल नंबर (Mobile Number)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus
              />
              
              <Text style={styles.testNote}>
                💡 For testing: Any 10-digit number works. Check backend logs for OTP.
              </Text>
              
              <Button
                title={isLoading ? 'भेजा जा रहा है...' : 'OTP भेजें (Send OTP)'}
                onPress={sendOTP}
                loading={isLoading}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.phoneText}>
                OTP sent to: +91{phoneNumber}
              </Text>
              <Text style={styles.testNote}>
                💡 Check your deployed backend logs at: https://dashboard.render.com
              </Text>
              
              <Input
                label="OTP कोड दर्ज करें (Enter OTP Code)"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
              
              <Button
                title={isLoading ? 'सत्यापित हो रहा है...' : 'सत्यापित करें (Verify)'}
                onPress={verifyOTP}
                loading={isLoading}
              />
              
              <View style={styles.resendContainer}>
                <Button
                  title="नया OTP भेजें (Resend OTP)"
                  onPress={resetToPhoneInput}
                  variant="secondary"
                />
              </View>
            </View>
          )}
        </Card>

        <Text style={styles.debugInfo}>
          Backend: {BASE_URL}
        </Text>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  icon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
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
  phoneText: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 16,
  },
  testNote: {
    textAlign: 'center',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 12,
  },
  resendContainer: {
    marginTop: 12,
  },
  debugInfo: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 16,
  },
});
