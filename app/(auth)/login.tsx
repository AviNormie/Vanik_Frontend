// app/(auth)/login.tsx
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

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { verifyWithBackend } = useAuth();
  const recaptchaVerifier = useRef<any>(null);
  const firebaseConfig = app ? app.options : undefined;

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    // Check if it's a test number
    const testNumbers = ['9999999999', '9876543210', '1234567890'];
    const isTestNumber = testNumbers.includes(phoneNumber);

    if (isTestNumber) {
      setIsCodeSent(true);
      Alert.alert('Test Mode', '📱 Test number detected! Use OTP: 123456');
      return;
    }

    if (!recaptchaVerifier.current) {
      Alert.alert('Error', 'reCAPTCHA not ready. Please wait and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = `+91${phoneNumber}`;
      console.log('📱 Sending OTP to:', formattedPhone);
      
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedPhone,
        recaptchaVerifier.current
      );
      
      console.log('✅ Verification ID received:', verificationId);
      setVerificationId(verificationId);
      setIsCodeSent(true);
      Alert.alert('Success', '📱 OTP sent to your phone!');
      
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
      console.log('🔍 Verifying OTP:', verificationCode);
      
      // Handle test numbers
      const testNumbers = ['9999999999', '9876543210', '1234567890'];
      const isTestNumber = testNumbers.includes(phoneNumber);
      
      if (isTestNumber) {
        if (verificationCode !== '123456') {
          Alert.alert('Error', 'Invalid test OTP. Use: 123456');
          setIsLoading(false);
          return;
        }
        
        // For test numbers, create a mock Firebase user experience
        console.log('✅ Test OTP verified');
        Alert.alert('Success', '🎉 Test login successful!');
        
        // Simulate backend verification for test
        try {
          // You can either skip backend for test or call with mock data
          // For now, let's navigate directly for test numbers
          router.replace('/(auth)/complete-profile');
        } catch (error) {
          console.log('Test mode - skipping backend, navigating to profile completion');
          router.replace('/(auth)/complete-profile');
        }
        
        setIsLoading(false);
        return;
      }

      // Real Firebase verification
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const result = await signInWithCredential(auth, credential);
      
      console.log('✅ Firebase Auth Success:', result.user.uid);
      
      // Get Firebase ID token
      const idToken = await result.user.getIdToken();
      console.log('🎫 Got Firebase ID token');
      
      // Verify with your backend
      try {
        const backendResult = await verifyWithBackend(idToken);
        
        console.log('✅ Backend verification successful');
        Alert.alert('Success', '🎉 Login successful!');
        
        // Navigate based on profile completion
        if (!backendResult.user.hasProfile) {
          console.log('👤 Profile incomplete, navigating to complete-profile');
          router.replace('/(auth)/complete-profile');
        } else {
          console.log('✅ Profile complete, navigating to dashboard');
          router.replace('/(tabs)');
        }
        
      } catch (backendError) {
        console.error('❌ Backend verification failed:', backendError);
        Alert.alert(
          'Backend Error', 
          `Authentication succeeded, but backend verification failed: ${backendError.message}\n\nYou can still continue to complete your profile.`,
          [
            { text: 'Continue', onPress: () => router.replace('/(auth)/complete-profile') }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Verify OTP Error:', error);
      
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
              
              <Text style={styles.testNote}>
                💡 For testing, use: 9999999999
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
                💡 Test OTP: 123456
              </Text>
              
              <Input
                label="OTP कोड दर्ज करें (Enter OTP Code)"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="123456"
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
});
