// components/auth/FarmerForm.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import Input from '../../app/components/ui/Input';
import Button from '../../app/components/ui/Button';
import Card from '../../app/components/ui/Card';

export interface FarmerFormData {
  name: string;
  village: string;
  district: string;
  state: string;
  farmSize: string;
  cropTypes: string;
  experience: string;
  landOwnership: 'OWNED' | 'LEASED' | 'SHARED';
  irrigationType: 'RAIN_FED' | 'IRRIGATED' | 'MIXED';
  language: 'hindi' | 'english';
}

interface FarmerFormProps {
  onSubmit: (data: FarmerFormData) => void;
  isLoading?: boolean;
}

const FarmerForm = ({ onSubmit, isLoading = false }: FarmerFormProps) => {
  const [formData, setFormData] = useState<FarmerFormData>({
    name: '',
    village: '',
    district: '',
    state: '',
    farmSize: '',
    cropTypes: '',
    experience: '',
    landOwnership: 'OWNED',
    irrigationType: 'RAIN_FED',
    language: 'hindi',
  });

  console.log('🌾 FarmerForm: Current form data:', {
    name: formData.name,
    village: formData.village,
    district: formData.district,
    state: formData.state,
    farmSize: formData.farmSize,
    hasAllRequiredFields: !!(formData.name && formData.village && formData.district && formData.state)
  });

  const updateField = (field: keyof FarmerFormData, value: string) => {
    console.log('🌾 FarmerForm: Updating field', field, 'with value:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('🌾 FarmerForm: Validating form submission...');
    
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया अपना नाम दर्ज करें (Please enter your name)');
      return;
    }
    
    if (!formData.village.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया अपना गांव दर्ज करें (Please enter your village)');
      return;
    }
    
    if (!formData.district.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया अपना जिला दर्ज करें (Please enter your district)');
      return;
    }
    
    if (!formData.state.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया अपना राज्य दर्ज करें (Please enter your state)');
      return;
    }

    if (formData.farmSize && isNaN(parseFloat(formData.farmSize))) {
      Alert.alert('त्रुटि (Error)', 'कृपया वैध खेत का आकार दर्ज करें (Please enter valid farm size)');
      return;
    }

    console.log('✅ FarmerForm: Form validation passed, submitting data:', formData);
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.title}>किसान पंजीकरण (Farmer Registration)</Text>
        <Text style={styles.subtitle}>
          कृपया अपनी जानकारी भरें (Please fill your information)
        </Text>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>व्यक्तिगत जानकारी (Personal Information)</Text>
          
          <Input
            label="पूरा नाम (Full Name) *"
            placeholder="अपना पूरा नाम दर्ज करें"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
          />
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>स्थान की जानकारी (Location Information)</Text>
          
          <Input
            label="गांव (Village) *"
            placeholder="अपना गांव दर्ज करें"
            value={formData.village}
            onChangeText={(value) => updateField('village', value)}
          />
          
          <Input
            label="जिला (District) *"
            placeholder="अपना जिला दर्ज करें"
            value={formData.district}
            onChangeText={(value) => updateField('district', value)}
          />
          
          <Input
            label="राज्य (State) *"
            placeholder="अपना राज्य दर्ज करें"
            value={formData.state}
            onChangeText={(value) => updateField('state', value)}
          />
        </View>

        {/* Farm Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>खेत की जानकारी (Farm Information)</Text>
          
          <Input
            label="खेत का आकार (Farm Size in Acres)"
            placeholder="उदाहरण: 2.5"
            value={formData.farmSize}
            onChangeText={(value) => updateField('farmSize', value)}
            keyboardType="decimal-pad"
          />
          
          <Input
            label="मुख्य फसलें (Main Crops)"
            placeholder="उदाहरण: गेहूं, चावल, मक्का"
            value={formData.cropTypes}
            onChangeText={(value) => updateField('cropTypes', value)}
          />
          
          <Input
            label="कृषि अनुभव (Farming Experience in Years)"
            placeholder="उदाहरण: 10"
            value={formData.experience}
            onChangeText={(value) => updateField('experience', value)}
            keyboardType="numeric"
          />
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>अतिरिक्त जानकारी (Additional Information)</Text>
          
          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>भूमि का स्वामित्व (Land Ownership):</Text>
            <View style={styles.radioOptions}>
              {[
                { value: 'OWNED', label: 'स्वयं की (Owned)' },
                { value: 'LEASED', label: 'पट्टे पर (Leased)' },
                { value: 'SHARED', label: 'साझा (Shared)' }
              ].map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  onPress={() => updateField('landOwnership', option.value)}
                  variant={formData.landOwnership === option.value ? 'primary' : 'secondary'}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>सिंचाई का प्रकार (Irrigation Type):</Text>
            <View style={styles.radioOptions}>
              {[
                { value: 'RAIN_FED', label: 'बारिश पर निर्भर (Rain Fed)' },
                { value: 'IRRIGATED', label: 'सिंचित (Irrigated)' },
                { value: 'MIXED', label: 'मिश्रित (Mixed)' }
              ].map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  onPress={() => updateField('irrigationType', option.value)}
                  variant={formData.irrigationType === option.value ? 'primary' : 'secondary'}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>भाषा प्राथमिकता (Language Preference):</Text>
            <View style={styles.radioOptions}>
              {[
                { value: 'hindi', label: 'हिंदी (Hindi)' },
                { value: 'english', label: 'English' }
              ].map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  onPress={() => updateField('language', option.value)}
                  variant={formData.language === option.value ? 'primary' : 'secondary'}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.submitContainer}>
          <Button
            title={isLoading ? 'सेव हो रहा है... (Saving...)' : 'पंजीकरण पूरा करें (Complete Registration)'}
            onPress={handleSubmit}
            loading={isLoading}
            variant="primary"
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#166534',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  radioOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  submitContainer: {
    marginTop: 16,
  },
});

export default FarmerForm;
export type { FarmerFormProps };