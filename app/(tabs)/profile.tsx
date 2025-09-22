// app/(tabs)/profile.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
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
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons
            name={getUserRole() === 'farmer' ? 'account-cowboy-hat' : 'account-tie'}
            size={80}
            color="white"
          />
        </View>
        
        <Text style={styles.userName}>{userInfo.name}</Text>
        <Text style={styles.userType}>{userInfo.type}</Text>
        
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={16} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.locationText}>{userInfo.location}</Text>
        </View>
      </View>

      {/* Profile Information */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          व्यक्तिगत जानकारी / Personal Information
        </Text>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="account" size={20} color="#16a34a" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>नाम / Name</Text>
            <Text style={styles.infoValue}>{userInfo.name}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="phone" size={20} color="#16a34a" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>मोबाइल / Mobile</Text>
            <Text style={styles.infoValue}>{user?.phoneNumber || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#16a34a" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>स्थान / Location</Text>
            <Text style={styles.infoValue}>{userInfo.location}</Text>
          </View>
        </View>
        
        {userInfo.state && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map" size={20} color="#16a34a" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>राज्य / State</Text>
              <Text style={styles.infoValue}>{userInfo.state}</Text>
            </View>
          </View>
        )}
        
        {userInfo.farmSize && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="field" size={20} color="#16a34a" />
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
          <MaterialCommunityIcons name="shield-check" size={20} color="#16a34a" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>सत्यापन स्थिति / Verification Status</Text>
            <Text style={[styles.infoValue, styles.verifiedText]}>
              ✅ सत्यापित / Verified
            </Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="account-badge" size={20} color="#16a34a" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>खाता प्रकार / Account Type</Text>
            <Text style={styles.infoValue}>{userInfo.type}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="calendar" size={20} color="#16a34a" />
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
          <MaterialCommunityIcons name="pencil" size={20} color="#6b7280" />
          <Text style={styles.actionText}>प्रोफाइल संपादित करें / Edit Profile</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <MaterialCommunityIcons name="bell" size={20} color="#6b7280" />
          <Text style={styles.actionText}>सूचनाएं / Notifications</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <MaterialCommunityIcons name="help-circle" size={20} color="#6b7280" />
          <Text style={styles.actionText}>सहायता / Help & Support</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <MaterialCommunityIcons name="information" size={20} color="#6b7280" />
          <Text style={styles.actionText}>ऐप के बारे में / About App</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="white" />
        <Text style={styles.logoutText}>लॉगआउट / Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeader: {
    backgroundColor: '#16a34a',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  verifiedText: {
    color: '#16a34a',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomSpacing: {
    height: 32,
  },
});
