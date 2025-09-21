// app/(tabs)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useEffect, useRef } from 'react';
import { logAllAsyncStorage } from '../../utils/asyncStorageLogger';
import FloatingAIAssistant from '../../components/shared/FloatingAIAssistant';

export default function TabsLayout() {
  const { user, profile, isLoading } = useAuth();
  const renderCountRef = useRef(0);
  
  // Increment render count and log to detect recursion
  renderCountRef.current += 1;
  
  // Log AsyncStorage data on first render
  useEffect(() => {
    if (renderCountRef.current === 1) {
      console.log('📦 TabsLayout: Logging AsyncStorage data on first render...');
      logAllAsyncStorage();
    }
    
    // Detect potential recursion
    if (renderCountRef.current > 10) {
      console.warn('⚠️ TabsLayout: Potential recursion detected! Render count:', renderCountRef.current);
    }
  }, []);
  
  // Memoize role calculation to prevent unnecessary re-renders
  const isFarmer = useMemo(() => {
    const result = user?.role?.toLowerCase() === 'farmer';
    
    // Only log when role actually changes, not on every render
    if (renderCountRef.current <= 5) {
      console.log('🎭 TabsLayout: Current user role:', user?.role);
      console.log('🎭 TabsLayout: Role check result:', result);
      console.log('🎭 TabsLayout: Is farmer:', result);
      console.log('🔄 TabsLayout: Render count:', renderCountRef.current);
    }
    
    return result;
  }, [user?.role]);

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

  // Redirect to complete profile if profile not complete
  const hasCompleteProfile = useMemo(() => {
    if (!profile) return false;
    
    if (profile.role === 'FARMER') {
      return !!profile.farmerProfile?.name;
    } else if (profile.role === 'RETAILER') {
      return !!profile.retailerProfile?.businessName;
    }
    
    return false;
  }, [profile]);
  
  if (!hasCompleteProfile) {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: {
          backgroundColor: '#16a34a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Farmer-specific simple layout */}
      {isFarmer ? (
        <>
          <Tabs.Screen
            name="farmer-dashboard"
            options={{
              title: 'My Crops',
              headerTitle: '🌾 My Listings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="leaf" size={size} color={color} />
              ),
            }}
          />

          {/* Hide wallet tab for farmers */}
          <Tabs.Screen
            name="wallet"
            options={{
              href: null, // Hide this tab
            }}
          />
          {/* Hide other tabs for farmers */}
          <Tabs.Screen
            name="index"
            options={{
              href: null, // Hide this tab
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null, // Hide this tab
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: null, // Hide this tab
            }}
          />
          <Tabs.Screen
            name="retailer-dashboard"
            options={{
              href: null, // Hide this tab
            }}
          />
          {/* <Tabs.Screen
            name="bulk-purchase"
            options={{
              href: null, // Hide this tab
            }}
          /> */}
          <Tabs.Screen
            name="offers"
            options={{
              href: null, // Hide this tab
            }}
          />
        </>
      ) : (
        /* Retailer layout */
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'डैशबोर्ड',
              headerTitle: '🌾 Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'प्रोफाइल',
              headerTitle: '👨‍🌾 Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="retailer-dashboard"
            options={{
              title: 'मार्केट',
              headerTitle: '🛒 Retailer Marketplace',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="storefront" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'सेटिंग्स',
              headerTitle: '⚙️ Settings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          />

          {/* Hide farmer-specific tabs for retailers */}
          <Tabs.Screen
            name="farmer-dashboard"
            options={{
              href: null, // Hide this tab
            }}
          />
          <Tabs.Screen
            name="wallet"
            options={{
              href: null, // Hide this tab for retailers (they have their own wallet in retailer dashboard)
            }}
          />
          <Tabs.Screen
            name="bulk-purchase"
            options={{
              href: null, // Hide this tab
            }}
          />
          <Tabs.Screen
            name="offers"
            options={{
              href: null, // Hide this tab
            }}
          />
        </>
      )}
      </Tabs>
      <FloatingAIAssistant />
    </View>
  );
}
