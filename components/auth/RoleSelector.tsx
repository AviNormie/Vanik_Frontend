// components/auth/RoleSelector.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type UserRole = 'FARMER' | 'RETAILER';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
  console.log('🎭 RoleSelector: Current selected role:', selectedRole);

  const handleRoleSelect = (role: UserRole) => {
    console.log('🎭 RoleSelector: Role changed from', selectedRole, 'to', role);
    onRoleChange(role);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>आपकी भूमिका चुनें (Select Your Role)</Text>
      <Text style={styles.subtitle}>
        कृपया अपनी भूमिका का चयन करें (Please select your role)
      </Text>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            styles.leftOption,
            selectedRole === 'FARMER' && styles.selectedOption
          ]}
          onPress={() => handleRoleSelect('FARMER')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.toggleText,
            selectedRole === 'FARMER' && styles.selectedText
          ]}>
            🌾 किसान (Farmer)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleOption,
            styles.rightOption,
            selectedRole === 'RETAILER' && styles.selectedOption
          ]}
          onPress={() => handleRoleSelect('RETAILER')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.toggleText,
            selectedRole === 'RETAILER' && styles.selectedText
          ]}>
            🏪 खुदरा विक्रेता (Retailer)
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.descriptionContainer}>
        {selectedRole === 'FARMER' ? (
          <View>
            <Text style={styles.descriptionTitle}>किसान के रूप में:</Text>
            <Text style={styles.descriptionText}>• फसल की जानकारी प्रबंधित करें</Text>
            <Text style={styles.descriptionText}>• मौसम की जानकारी प्राप्त करें</Text>
            <Text style={styles.descriptionText}>• बाजार की कीमतें देखें</Text>
            <Text style={styles.descriptionText}>• कृषि सलाह प्राप्त करें</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.descriptionTitle}>खुदरा विक्रेता के रूप में:</Text>
            <Text style={styles.descriptionText}>• इन्वेंटरी प्रबंधित करें</Text>
            <Text style={styles.descriptionText}>• बिक्री ट्रैक करें</Text>
            <Text style={styles.descriptionText}>• बाजार के रुझान देखें</Text>
            <Text style={styles.descriptionText}>• आपूर्तिकर्ताओं से जुड़ें</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#166534',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#6b7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  leftOption: {
    marginRight: 2,
  },
  rightOption: {
    marginLeft: 2,
  },
  selectedOption: {
    backgroundColor: '#16a34a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedText: {
    color: 'white',
  },
  descriptionContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#166534',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
});

export default RoleSelector;
export { RoleSelector };
export type { RoleSelectorProps };