// components/WelcomeMessage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface WelcomeMessageProps {
  visible: boolean;
  onClose: () => void;
}

export default function WelcomeMessage({ visible, onClose }: WelcomeMessageProps) {
  const { profile } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getUserRole = () => {
    return profile?.role?.toLowerCase() || 'farmer';
  };

  const getUserName = () => {
    if (profile?.farmerProfile?.name) {
      return profile.farmerProfile.name;
    }
    if (profile?.retailerProfile?.businessName) {
      return profile.retailerProfile.businessName;
    }
    return 'उपयोगकर्ता';
  };

  const getWelcomeContent = () => {
    const role = getUserRole();
    const name = getUserName();
    
    if (role === 'farmer') {
      return {
        icon: 'account-cowboy-hat',
        hindiTitle: `स्वागत है किसान जी!`,
        hindiSubtitle: `नमस्ते ${name}`,
        englishTitle: `Welcome Farmer!`,
        englishSubtitle: `Hello ${name}`,
        description: 'आपका कृषि सहायक ऐप तैयार है। फसल बेचने, मौसम देखने और AI सहायता के लिए नीचे के विकल्प देखें।',
        descriptionEn: 'Your agriculture assistant app is ready. Check the options below for selling crops, weather updates, and AI assistance.',
      };
    } else {
      return {
        icon: 'account-tie',
        hindiTitle: `स्वागत है व्यापारी जी!`,
        hindiSubtitle: `नमस्ते ${name}`,
        englishTitle: `Welcome Retailer!`,
        englishSubtitle: `Hello ${name}`,
        description: 'आपका व्यापारिक ऐप तैयार है। बाजार देखने, फसल खरीदने और व्यापार के लिए नीचे के विकल्प देखें।',
        descriptionEn: 'Your business app is ready. Check the options below for marketplace, crop purchasing, and trading.',
      };
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const welcomeContent = getWelcomeContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={welcomeContent.icon as any}
                size={60}
                color="white"
              />
            </View>
            
            <Text style={styles.hindiTitle}>{welcomeContent.hindiTitle}</Text>
            <Text style={styles.hindiSubtitle}>{welcomeContent.hindiSubtitle}</Text>
            
            <Text style={styles.englishTitle}>{welcomeContent.englishTitle}</Text>
            <Text style={styles.englishSubtitle}>{welcomeContent.englishSubtitle}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>{welcomeContent.description}</Text>
            <Text style={styles.descriptionEn}>{welcomeContent.descriptionEn}</Text>
            
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="weather-cloudy" size={24} color="#16a34a" />
                <Text style={styles.featureText}>मौसम / Weather</Text>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="robot" size={24} color="#16a34a" />
                <Text style={styles.featureText}>AI सहायक / AI Assistant</Text>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="wallet" size={24} color="#16a34a" />
                <Text style={styles.featureText}>वॉलेट / Wallet</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>शुरू करें / Get Started</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    backgroundColor: '#16a34a',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  hindiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  hindiSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  englishTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 2,
  },
  englishSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  descriptionEn: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});