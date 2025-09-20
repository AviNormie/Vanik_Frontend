// components/shared/LogoutButton.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Button from '../../app/components/ui/Button';

interface LogoutButtonProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  showConfirmation?: boolean;
}

const LogoutButton = ({ 
  title = 'Logout', 
  variant = 'danger',
  showConfirmation = true 
}: LogoutButtonProps) => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPress = () => {
    if (showConfirmation) {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: handleLogout
          }
        ]
      );
    } else {
      handleLogout();
    }
  };

  return (
    <Button
      title={title}
      onPress={onPress}
      loading={isLoading}
      variant={variant}
    />
  );
};

export default LogoutButton;
export { LogoutButton };