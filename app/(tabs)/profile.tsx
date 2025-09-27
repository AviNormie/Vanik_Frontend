// app/(tabs)/profile.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  StatusBar,
} from 'react-native';
import LanguageSelector from '../../components/shared/LanguageSelector';
import { Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'लॉगआउट / Logout',
      'क्या आप वाकई लॉगआउट करना चाहते हैं?\nAre you sure you want to logout?',
      [
        {
          text: 'रद्द करें / Cancel',
          style: 'cancel',
        },
        {
          text: 'लॉगआउट / Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getUserRole = () => {
    return profile?.role?.toLowerCase() || 'farmer';
  };

  const getUserInfo = () => {
    if (profile?.farmerProfile) {
      return {
        name: profile.farmerProfile.name,
        location: `${profile.farmerProfile.village}, ${profile.farmerProfile.district}`,
        state: profile.farmerProfile.state,
        farmSize: profile.farmerProfile.farmSize,
        type: 'किसान / Farmer',
      };
    }
    if (profile?.retailerProfile) {
      return {
        name: profile.retailerProfile.businessName,
        location: `${profile.retailerProfile.city}`,
        state: profile.retailerProfile.state,
        type: 'व्यापारी / Retailer',
      };
    }
    return {
      name: 'उपयोगकर्ता / User',
      location: 'स्थान उपलब्ध नहीं / Location not available',
      type: 'उपयोगकर्ता / User',
    };
  };

  const userInfo = getUserInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
   <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
   
      {/* Profile Header with Background */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1711397651462-3b2a22f5cfc8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2VhdGhlciUyMGFuZCUyMGNyb3BzfGVufDB8fDB8fHwy' }}
        style={styles.headerBackgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons
                name={getUserRole() === 'farmer' ? 'account-cowboy-hat' : 'account-tie'}
                size={80}
                color="white"
              />
            </View>
            <LanguageSelector />
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userType}>{userInfo.type}</Text>
            
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.locationText}>{userInfo.location}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            व्यक्तिगत जानकारी / Personal Information
          </Text>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="account" size={20} color="#4ade80" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>नाम / Name</Text>
              <Text style={styles.infoValue}>{userInfo.name}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="phone" size={20} color="#4ade80" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>मोबाइल / Mobile</Text>
              <Text style={styles.infoValue}>{user?.phoneNumber || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#4ade80" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>स्थान / Location</Text>
              <Text style={styles.infoValue}>{userInfo.location}</Text>
            </View>
          </View>
          
          {userInfo.state && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map" size={20} color="#4ade80" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>राज्य / State</Text>
                <Text style={styles.infoValue}>{userInfo.state}</Text>
              </View>
            </View>
          )}
          
          {userInfo.farmSize && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="field" size={20} color="#4ade80" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>खेत का आकार / Farm Size</Text>
                <Text style={styles.infoValue}>{userInfo.farmSize} एकड़ / Acres</Text>
              </View>
            </View>
          )}
        </View>

        {/* Account Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            खाता जानकारी / Account Information
          </Text>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#4ade80" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>सत्यापन स्थिति / Verification Status</Text>
              <Text style={[styles.infoValue, styles.verifiedText]}>
                ✅ सत्यापित / Verified
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="account-badge" size={20} color="#4ade80" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>खाता प्रकार / Account Type</Text>
              <Text style={styles.infoValue}>{userInfo.type}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={20} color="#4ade80" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>सदस्यता तिथि / Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString('hi-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings & Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>
            सेटिंग्स / Settings
          </Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="pencil" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.actionText}>प्रोफाइल संपादित करें / Edit Profile</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="bell" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.actionText}>सूचनाएं / Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="help-circle" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.actionText}>सहायता / Help & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="information" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.actionText}>ऐप के बारे में / About App</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>लॉगआउट / Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',

  },
  headerBackgroundImage: {
    height: 350,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 120,
    height: 90,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  infoCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  verifiedText: {
    color: '#4ade80',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomSpacing: {
    height: 100,
  },
});