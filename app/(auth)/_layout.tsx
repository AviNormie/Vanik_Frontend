// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="login" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="complete-profile" 
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}