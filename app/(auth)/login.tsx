// app/(auth)/login.tsx - REAL FIREBASE VERSION
import React, { useState, useRef } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../config/firebase';
import app from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const BASE_URL = process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'https://auth-service-sih.onrender.com'; // Use env variable or fallback
console.log('🔧 Login: BASE_URL configured as:', BASE_URL);
console.log('🔧 Login: EXPO_PUBLIC_AUTH_BACKEND_URL env var:', process.env.EXPO_PUBLIC_AUTH_BACKEND_URL);

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const recaptchaVerifier = useRef<any>(null);
  const firebaseConfig = app ? app.options : undefined;

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!recaptchaVerifier.current) {
      Alert.alert('Error', 'reCAPTCHA not ready. Please wait and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = `+91${phoneNumber}`;
      console.log('📱 Sending real Firebase OTP to:', formattedPhone);
      
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedPhone,
        recaptchaVerifier.current
      );
      
      console.log('✅ Firebase Verification ID received:', verificationId);
      setVerificationId(verificationId);
      setIsCodeSent(true);
      Alert.alert('Success', '📱 Real SMS OTP sent to your phone!');
      
    } catch (error: any) {
      console.error('❌ Firebase Send OTP Error:', error);
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
      console.log('🔍 Verifying Firebase OTP:', verificationCode);
      
      // Firebase verification
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const result = await signInWithCredential(auth, credential);
      
      console.log('✅ Firebase Auth Success:', result.user.uid);
      
      // Get Firebase ID token
      const idToken = await result.user.getIdToken();
      console.log('🎫 Got Firebase ID token');
      
      // Verify with your backend using Firebase token
      try {
        // Test backend connectivity first
        console.log('🔍 Login: Testing backend connectivity...');
        try {
          const healthResponse = await fetch(`${BASE_URL}/auth/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('✅ Login: Backend health check status:', healthResponse.status);
        } catch (healthError) {
          console.error('❌ Login: Backend health check failed:', healthError);
        }

        console.log('🌐 Login: Making backend request to:', `${BASE_URL}/auth/verify-firebase`);
        console.log('📤 Login: Request payload:', {
          idToken: idToken ? `${idToken.substring(0, 20)}...` : 'null',
          phoneNumber: result.user.phoneNumber,
          uid: result.user.uid,
        });
        
        const response = await fetch(`${BASE_URL}/auth/verify-firebase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
            phoneNumber: result.user.phoneNumber,
            uid: result.user.uid,
          }),
        });

        console.log('📥 Login: Backend response status:', response.status);
        console.log('📥 Login: Backend response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Login: Backend error response:', errorText);
          throw new Error(`Backend responded with ${response.status}: ${errorText}`);
        }

        const backendResult = await response.json();
        console.log('✅ Backend verification successful:', backendResult);
        
        console.log('💾 Login: About to store user data:', {
          userId: backendResult.user?.id,
          phoneNumber: backendResult.user?.phoneNumber,
          name: backendResult.user?.name,
          isNewUser: backendResult.user?.isNewUser,
          hasSessionToken: !!backendResult.session?.token
        });
        
        // Store user data
        await login(backendResult.user, backendResult.session.token);
        
        console.log('✅ Login: User data stored successfully');
        Alert.alert('Success', '🎉 Login successful!');
        
        // Navigate based on profile completion
        if (backendResult.user.isNewUser || !backendResult.user.name) {
          console.log('👤 Profile incomplete, navigating to complete-profile');
          router.replace('/(auth)/complete-profile');
        } else {
          console.log('✅ Profile complete, navigating to dashboard');
          router.replace('/(tabs)');
        }
        
      } catch (backendError: any) {
        console.error('❌ Backend verification failed:', backendError);
        Alert.alert(
          'Backend Error', 
          `Firebase authentication succeeded, but backend verification failed. You can still continue to complete your profile.`,
          [
            { text: 'Continue', onPress: () => router.replace('/(auth)/complete-profile') }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Firebase Verify OTP Error:', error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP expired. Please request a new one';
      }
      
      Alert.alert('Error', `OTP verification failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToPhoneInput = () => {
    setIsCodeSent(false);
    setVerificationCode('');
    setVerificationId('');
  };

  return (
    <ScrollView style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />

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
              
              <Text style={styles.note}>
                📱 Real SMS will be sent to your phone number
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
                SMS OTP sent to: +91{phoneNumber}
              </Text>
              <Text style={styles.note}>
                📩 Check your SMS messages for the OTP
              </Text>
              
              <Input
                label="OTP कोड दर्ज करें (Enter OTP Code)"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter 6-digit OTP from SMS"
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
  note: {
    textAlign: 'center',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 12,
  },
  resendContainer: {
    marginTop: 12,
  },
});
