// app/(auth)/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
  const { user, farmerProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Redirect authenticated users with complete profile
  if (user && farmerProfile?.name) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="complete-profile" />
    </Stack>
  );
}
