// app/(tabs)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { LanguageProvider, useLanguage } from '../../context/LanguageContext';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useMemo, useEffect, useRef } from 'react';
import FloatingAIAssistant from '../../components/shared/FloatingAIAssistant';
import LanguageSelector from '../../components/shared/LanguageSelector';

const { width: screenWidth } = Dimensions.get('window');

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

  // Common tab bar styling - UPDATED FOR CIRCULAR DESIGN
  const tabBarWidth = screenWidth * 0.4; // 60% of screen width (40% reduction)
  const tabBarMargin = (screenWidth - tabBarWidth) / 2; // Center calculation
  
  const tabBarStyle = {
    position: 'absolute' as const,
    bottom: 20,
    left: tabBarMargin, // Calculated center position
    right: tabBarMargin, // Also set right margin for proper centering
    backgroundColor: '#000000', // Solid black background
    borderRadius: 30,
    height: 65,
    paddingBottom: 0,
    paddingTop: 0,
    paddingHorizontal: 8, // Reduced horizontal padding for tighter spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
    borderTopWidth: 0, // Remove any top border
    borderWidth: 0, // Remove all borders
  };

  const screenOptions = {
    tabBarActiveTintColor: '#ffffff',
    tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
    headerStyle: {
      backgroundColor: '#16a34a',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold' as const,
    },
    tabBarStyle,
    tabBarShowLabel: false,
    tabBarIconStyle: {
      marginTop: 0,
    },
    tabBarBackground: () => null, // Remove any background component
    tabBarButton: (props: any) => {
      // Check if this is the center AI tab by checking the route name
      const isAITab = props.to && props.to.includes('crop_disease');
      
      return (
        <TouchableOpacity
          {...props}
          style={[
            {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              height: 65,
              marginHorizontal: 2, // Reduced margin between icons
            }
          ]}
        >
          <View style={[
            styles.tabIconContainer,
            isAITab && styles.centerTabIconContainer,
            props.accessibilityState?.selected && !isAITab && styles.activeTabIconContainer
          ]}>
            {props.children}
          </View>
        </TouchableOpacity>
      );
    },
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
                  <Ionicons name="home" size={24} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="farmer-dashboard"
              options={{
                title: t('farmingActivities'),
                headerTitle: `🌾 ${t('farmingActivities')}`,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="leaf" size={24} color={color} />
                ),
              }}
            />

            {/* AI Assistant - Center with visible icon */}
            <Tabs.Screen
              name="crop_disease"
              options={{
                title: '',
                headerTitle: `🔬 ${t('cropDisease')}`,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="robot" size={28} color="#ffffff" />
                ),
                tabBarLabel: () => null,
              }}
            />

            <Tabs.Screen
              name="weather"
              options={{
                title: t('weather'),
                headerTitle: `🌤️ ${t('weather')}`,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="weather-cloudy" size={24} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="profile"
              options={{
                title: t('profile'),
                headerTitle: `👤 ${t('profile')}`,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={24} color={color} />
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
                <Ionicons name="home" size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="retailer-dashboard"
            options={{
              title: t('market'),
              headerTitle: `🛒 ${t('market')}`,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="storefront" size={24} color={color} />
              ),
            }}
          />

          {/* AI Assistant - Center with visible icon */}
          <Tabs.Screen
            name="crop_disease"
            options={{
              title: '',
              headerTitle: `🔬 ${t('cropDisease')}`,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="robot" size={28} color="#ffffff" />
              ),
              tabBarLabel: () => null,
            }}
          />

          <Tabs.Screen
            name="weather"
            options={{
              title: t('weather'),
              headerTitle: `🌤️ ${t('weather')}`,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="weather-cloudy" size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: t('profile'),
              headerTitle: `👤 ${t('profile')}`,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={24} color={color} />
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
  // CIRCULAR TAB STYLES - MATCHING YOUR IMAGE
  tabIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ade80',
  },
  activeTabIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});