// app/(tabs)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { LanguageProvider, useLanguage } from '../../context/LanguageContext';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useMemo, useEffect, useRef } from 'react';
import FloatingAIAssistant from '../../components/shared/FloatingAIAssistant';
import LanguageSelector from '../../components/shared/LanguageSelector';

function TabsContent() {
  const { user, profile, isLoading, logout } = useAuth();
  const { t } = useLanguage();

  // Early returns MUST come before any hooks to follow Rules of Hooks
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check if profile is complete before using hooks
  const hasCompleteProfile = (() => {
    if (!profile) return false;
    
    if (profile.role === 'FARMER') {
      return !!profile.farmerProfile?.name;
    } else if (profile.role === 'RETAILER') {
      return !!profile.retailerProfile?.businessName;
    }
    
    return false;
  })();
  
  if (!hasCompleteProfile) {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  // Now it's safe to use hooks after all early returns
  const renderCountRef = useRef(0);
  
  // Increment render count and log to detect recursion
  renderCountRef.current += 1;
  
  // Log render count to detect potential recursion
  useEffect(() => {
    // Detect potential recursion
    if (renderCountRef.current > 10) {
      console.warn('⚠️ TabsLayout: Potential recursion detected! Render count:', renderCountRef.current);
    }
  }, []);
  
  // Memoize role calculation to prevent unnecessary re-renders
  const isFarmer = useMemo(() => {
    // Check both user.role and profile.role for compatibility
    const userRole = user?.role?.toLowerCase();
    const profileRole = profile?.role?.toLowerCase();
    
    // Log for debugging
    console.log('🔍 TabsLayout: Role check - user.role:', userRole, 'profile.role:', profileRole);
    
    // Return true if either indicates farmer
    return userRole === 'farmer' || profileRole === 'farmer';
  }, [user?.role, profile?.role]);

  // Common tab bar styling
  const tabBarStyle = {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  };

  const screenOptions = {
    tabBarActiveTintColor: '#16a34a',
    tabBarInactiveTintColor: 'rgba(107, 114, 128, 0.8)',
    headerStyle: {
      backgroundColor: '#16a34a',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold' as const,
    },
    tabBarStyle,
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600' as const,
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginTop: 4,
    },
    tabBarBackground: () => (
      <BlurView
        intensity={80}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
    ),
    headerRight: () => (
      <View style={styles.headerRightContainer}>
        <LanguageSelector />
        <TouchableOpacity
          onPress={() => logout()}
          style={styles.logoutButton}
        >
          <MaterialCommunityIcons name="logout" size={20} color="white" />
        </TouchableOpacity>
      </View>
    ),
  };

  // Render completely different tab layouts based on role
  if (isFarmer) {
    // FARMER LAYOUT: Home, Sell Crops, AI (center), Weather, Profile
    return (
      <LanguageProvider>
        <View style={{ flex: 1 }}>
          <Tabs screenOptions={screenOptions}>
            <Tabs.Screen
              name="index"
              options={{
                title: t('home'),
                headerTitle: `🏠 ${t('home')}`,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="farmer-dashboard"
              options={{
                title: t('farmingActivities'),
                headerTitle: `🌾 ${t('farmingActivities')}`,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="leaf" size={size} color={color} />
                ),
              }}
            />

            {/* AI Assistant - Center placeholder (invisible) */}
            <Tabs.Screen
              name="crop_disease"
              options={{
                title: '',
                headerTitle: `🔬 ${t('cropDisease')}`,
                tabBarIcon: () => <View style={{ width: 50 }} />, // Invisible placeholder
                tabBarLabel: () => null,
              }}
            />

            <Tabs.Screen
              name="weather"
              options={{
                title: t('weather'),
                headerTitle: `🌤️ ${t('weather')}`,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="weather-cloudy" size={size} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="profile"
              options={{
                title: t('profile'),
                headerTitle: `👤 ${t('profile')}`,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={size} color={color} />
                ),
              }}
            />

            {/* Hide other tabs */}
            <Tabs.Screen name="wallet" options={{ href: null }} />
            <Tabs.Screen name="retailer-dashboard" options={{ href: null }} />
            <Tabs.Screen name="settings" options={{ href: null }} />
            <Tabs.Screen name="bulk-purchase" options={{ href: null }} />
            <Tabs.Screen name="offers" options={{ href: null }} />
          </Tabs>
          
          {/* Floating AI Assistant */}
          <FloatingAIAssistant />
        </View>
      </LanguageProvider>
    );
  }

  // RETAILER LAYOUT: Home, Marketplace, AI (center), Weather, Profile
  return (
    <LanguageProvider>
      <View style={{ flex: 1 }}>
        <Tabs screenOptions={() => ({
          ...screenOptions,
          headerTitleStyle: {
            fontWeight: '700' as const // Using specific font weight value instead of "bold"
          }
        })}>
          <Tabs.Screen
            name="index"
            options={{
              title: t('home'),
              headerTitle: `🏠 ${t('home')}`,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="retailer-dashboard"
            options={{
              title: t('market'),
              headerTitle: `🛒 ${t('market')}`,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="storefront" size={size} color={color} />
              ),
            }}
          />

          {/* AI Assistant - Center placeholder (invisible) */}
          <Tabs.Screen
            name="crop_disease"
            options={{
              title: '',
              headerTitle: `🔬 ${t('cropDisease')}`,
              tabBarIcon: () => <View style={{ width: 50 }} />, // Invisible placeholder
              tabBarLabel: () => null,
            }}
          />

          <Tabs.Screen
            name="weather"
            options={{
              title: t('weather'),
              headerTitle: `🌤️ ${t('weather')}`,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="weather-cloudy" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: t('profile'),
              headerTitle: `👤 ${t('profile')}`,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />

          {/* Hide other tabs */}
          <Tabs.Screen name="wallet" options={{ href: null }} />
          <Tabs.Screen name="farmer-dashboard" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
          <Tabs.Screen name="bulk-purchase" options={{ href: null }} />
          <Tabs.Screen name="offers" options={{ href: null }} />
        </Tabs>
        
        {/* Floating AI Assistant */}
        <FloatingAIAssistant />
      </View>
    </LanguageProvider>
  );
}

export default function TabsLayout() {
  return (
    <LanguageProvider>
      <TabsContent />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
