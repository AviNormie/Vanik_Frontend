
import React, { useState, useRef } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../config/firebase';
import app from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

// Platform-specific imports
let FirebaseRecaptchaVerifierModal: any = null;
let PhoneAuthProvider: any = null;
let signInWithCredential: any = null;

if (Platform.OS !== 'web') {
  FirebaseRecaptchaVerifierModal = require('expo-firebase-recaptcha').FirebaseRecaptchaVerifierModal;
  const firebaseAuth = require('firebase/auth');
  PhoneAuthProvider = firebaseAuth.PhoneAuthProvider;
  signInWithCredential = firebaseAuth.signInWithCredential;
}

const BASE_URL = process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'https://auth-service-sih.onrender.com'; // Use env variable or fallback
console.log('🔧 Login: BASE_URL configured as:', BASE_URL);
console.log('🔧 Login: EXPO_PUBLIC_AUTH_BACKEND_URL env var:', process.env.EXPO_PUBLIC_AUTH_BACKEND_URL);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

    setIsLoading(true);

    try {
      const formattedPhone = `+91${phoneNumber}`;

      if (Platform.OS === 'web') {
        // For web platform, simulate OTP sending and use backend directly
        console.log('🌐 Web platform: Simulating OTP for:', formattedPhone);
        setVerificationId('web-mock-verification-id');
        setIsCodeSent(true);
        Alert.alert('Success', '📱 For web demo, use OTP: 123456');
      } else {
        // Mobile platform: Use Firebase
        if (!recaptchaVerifier.current) {
          Alert.alert('Error', 'reCAPTCHA not ready. Please wait and try again.');
          return;
        }

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
      }

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
      let idToken: string;
      let userUid: string;
      let userPhoneNumber: string;

      if (Platform.OS === 'web') {
        // Web platform: Mock verification
        if (verificationCode !== '123456') {
          Alert.alert('Error', 'Invalid OTP. For web demo, use: 123456');
          setIsLoading(false);
          return;
        }

        console.log('🌐 Web platform: Mock OTP verification successful');
        idToken = 'web-mock-token-' + Date.now();
        userUid = 'web-user-' + phoneNumber;
        userPhoneNumber = `+91${phoneNumber}`;
      } else {
        // Mobile platform: Firebase verification
        console.log('🔍 Verifying Firebase OTP:', verificationCode);

        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        const result = await signInWithCredential(auth, credential);

        console.log('✅ Firebase Auth Success:', result.user.uid);

        // Get Firebase ID token
        idToken = await result.user.getIdToken();
        userUid = result.user.uid;
        userPhoneNumber = result.user.phoneNumber || `+91${phoneNumber}`;
        console.log('🎫 Got Firebase ID token');
      }

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
          phoneNumber: userPhoneNumber,
          uid: userUid,
        });

        const response = await fetch(`${BASE_URL}/auth/verify-firebase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
            phoneNumber: userPhoneNumber,
            uid: userUid,
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

        // Store Firebase ID token as fallback when backend fails
        const tempUser = {
          id: userUid,
          phoneNumber: userPhoneNumber || '',
          name: '',
          role: '',
          isNewUser: true
        };

        console.log('💾 Login: Storing Firebase ID token as fallback');
        await login(tempUser, idToken);

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
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternDot, { top: 100, left: 50 }]} />
        <View style={[styles.patternDot, { top: 200, right: 80 }]} />
        <View style={[styles.patternDot, { top: 300, left: 30 }]} />
        <View style={[styles.patternDot, { bottom: 200, right: 60 }]} />
        <View style={[styles.patternDot, { bottom: 100, left: 100 }]} />
      </View>

      {Platform.OS !== 'web' && FirebaseRecaptchaVerifierModal && (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification={true}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#16a34a" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🌾</Text>
            </View>
            <View style={styles.logoGlow} />
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.title}>किसान लॉगिन</Text>
            <Text style={styles.subtitle}>Secure Farmer Authentication</Text>
          </View>
        </View>

        {/* Main Form Card */}
        <View style={styles.formCard}>
          {!isCodeSent ? (
            <>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Enter Mobile Number</Text>
                <Text style={styles.formDescription}>
                  We'll send a verification code to your phone
                </Text>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>मोबाइल नंबर (Mobile Number)</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.flag}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <View style={styles.phoneInputWrapper}>
                    <Input
                      label=""
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="9876543210"
                      keyboardType="phone-pad"
                      maxLength={10}
                      autoFocus
                    />
                  </View>
                </View>
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>
                    {Platform.OS === 'web' ? '🌐' : '📱'}
                  </Text>
                </View>
                <Text style={styles.infoText}>
                  {Platform.OS === 'web'
                    ? 'Web Demo: Use OTP 123456 after clicking Send OTP'
                    : 'Real SMS will be sent to your phone number'
                  }
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title={isLoading ? 'भेजा जा रहा है...' : 'OTP भेजें (Send OTP)'}
                  onPress={sendOTP}
                  loading={isLoading}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Verify Your Number</Text>
                <Text style={styles.phoneDisplay}>
                  Code sent to +91 {phoneNumber}
                </Text>
              </View>

              <View style={styles.otpSection}>
                <Text style={styles.inputLabel}>OTP कोड दर्ज करें (Enter OTP Code)</Text>
                <View style={styles.otpInputContainer}>
                  <Input
                    label=""
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="• • • • • •"
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>
                    {Platform.OS === 'web' ? '🔑' : '📩'}
                  </Text>
                </View>
                <Text style={styles.infoText}>
                  {Platform.OS === 'web'
                    ? 'Web Demo: Enter OTP 123456'
                    : 'Check your SMS messages for the OTP'
                  }
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title={isLoading ? 'सत्यापित हो रहा है...' : 'सत्यापित करें (Verify)'}
                  onPress={verifyOTP}
                  loading={isLoading}
                />
              </View>

              <View style={styles.resendSection}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <Button
                  title="नया OTP भेजें (Resend OTP)"
                  onPress={resetToPhoneInput}
                  variant="secondary"
                />
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // Light green background
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 40,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: '#10b981',
    borderRadius: 60,
    opacity: 0.1,
    top: -10,
    left: -10,
  },
  logoCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 4,
    borderColor: '#ecfdf5',
    position: 'relative',
    zIndex: 1,
  },
  logoIcon: {
    fontSize: 45,
    textShadowColor: '#10b981',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#dcfce7',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 36,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.2,
    shadowRadius: 35,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 32,
    position: 'relative',
    backdropFilter: 'blur(20px)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  formDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneDisplay: {
    fontSize: 17,
    color: '#10b981',
    fontWeight: '700',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#dcfce7',
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputSection: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  countryCodeBox: {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#64748b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 56,
    backdropFilter: 'blur(10px)',
  },
  flag: {
    fontSize: 22,
  },
  countryCode: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  otpSection: {
    marginBottom: 28,
  },
  otpInputContainer: {
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 249, 255, 0.9)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(224, 242, 254, 0.6)',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    backdropFilter: 'blur(15px)',
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#dbeafe',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  infoIcon: {
    fontSize: 22,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#1e40af',
    lineHeight: 22,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 8,
  },
  resendSection: {
    marginTop: 28,
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resendText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});