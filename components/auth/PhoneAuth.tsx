import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

interface PhoneAuthProps {
  onAuthSuccess?: () => void;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ onAuthSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const setupRecaptcha = () => {
    if (typeof window !== 'undefined') {
      // For web platform
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
            },
          }
        );
      }
      return window.recaptchaVerifier;
    }
    return null;
  };

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const recaptchaVerifier = setupRecaptcha();
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not available');
      }

      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (!confirmationResult) {
      Alert.alert('Error', 'Please send OTP first');
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      Alert.alert('Success', 'Phone number verified successfully!');
      onAuthSuccess?.();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setOtp('');
    setConfirmationResult(null);
    setOtpSent(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Authentication</Text>
      <Text style={styles.subtitle}>Enter your phone number to receive OTP</Text>

      {!otpSent ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number (e.g., +919876543210)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={sendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter OTP</Text>
          <Text style={styles.phoneDisplay}>Sent to: {phoneNumber}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={verifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetForm}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Change Number</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* reCAPTCHA container for web */}
      <View id="recaptcha-container" style={styles.recaptchaContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#16a34a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  phoneDisplay: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  secondaryButtonText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '600',
  },
  recaptchaContainer: {
    height: 0,
    overflow: 'hidden',
  },
});

// Extend window interface for TypeScript
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default PhoneAuth;