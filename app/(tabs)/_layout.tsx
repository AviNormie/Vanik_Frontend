// app/(tabs)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useEffect, useRef } from 'react';

export default function TabsLayout() {
  const { user, profile, isLoading } = useAuth();
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
    // Check multiple possible role formats
    const userRole = user?.role?.toLowerCase();
    const profileRole = profile?.role?.toLowerCase();
    
    const result = userRole === 'farmer' || profileRole === 'farmer';
    
    // Enhanced logging for debugging
    console.log('🎭 TabsLayout: User object:', user);
    console.log('🎭 TabsLayout: User role:', user?.role);
    console.log('🎭 TabsLayout: Profile role:', profile?.role);
    console.log('🎭 TabsLayout: Is farmer result:', result);
    
    return result;
  }, [user?.role, profile?.role]);

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

  // Render completely different tab layouts based on role
  if (isFarmer) {
    // FARMER LAYOUT - ONLY 2 TABS: Farmer Dashboard + Wallet
    return (
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
        <Tabs.Screen
          name="farmer-dashboard"
          options={{
            title: 'Sell Crops',
            headerTitle: '🌾 Farmer Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            headerTitle: '💰 My Wallet',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />

        {/* Hide all other tabs for farmers */}
        <Tabs.Screen
          name="index"
          options={{
            href: null, // This hides the tab
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // This hides the tab
          }}
        />
        <Tabs.Screen
          name="retailer-dashboard"
          options={{
            href: null, // This hides the tab
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null, // This hides the tab
          }}
        />
        <Tabs.Screen
          name="bulk-purchase"
          options={{
            href: null, // This hides the tab
          }}
        />
        <Tabs.Screen
          name="offers"
          options={{
            href: null, // This hides the tab
          }}
        />
      </Tabs>
    );
  }

  // RETAILER LAYOUT - ONLY 3 TABS: Retailer Dashboard, Bulk, Wallet, Offers
  return (
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
      <Tabs.Screen
        name="retailer-dashboard"
        options={{
          title: 'Marketplace',
          headerTitle: '🛒 Retailer Marketplace',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bulk-purchase"
        options={{
          title: 'Bulk',
          headerTitle: '📦 Bulk Purchase',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          headerTitle: '💰 My Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          headerTitle: '💼 My Offers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />

      {/* Hide tabs that retailers shouldn't see */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="farmer-dashboard"
        options={{
          href: null, // This hides the tab
        }}
      />
    </Tabs>
  );
}
