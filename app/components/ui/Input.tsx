// components/ui/Input.tsx
import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'decimal-pad';
  maxLength?: number;
  autoFocus?: boolean;
}

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  autoFocus = false,
}: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoFocus={autoFocus}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
});

export default Input;
export { Input };
