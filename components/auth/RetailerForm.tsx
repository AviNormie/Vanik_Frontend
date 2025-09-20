// components/auth/RetailerForm.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import Input from '../../app/components/ui/Input';
import Button from '../../app/components/ui/Button';
import Card from '../../app/components/ui/Card';

export interface RetailerFormData {
  businessName: string;
  ownerName: string;
  businessType: 'WHOLESALE' | 'RETAIL' | 'BOTH';
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  licenseNumber: string;
  experience: string;
  specialization: string;
  language: 'hindi' | 'english';
}

interface RetailerFormProps {
  onSubmit: (data: RetailerFormData) => void;
  isLoading?: boolean;
}

const RetailerForm = ({ onSubmit, isLoading = false }: RetailerFormProps) => {
  const [formData, setFormData] = useState<RetailerFormData>({
    businessName: '',
    ownerName: '',
    businessType: 'RETAIL',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    licenseNumber: '',
    experience: '',
    specialization: '',
    language: 'hindi',
  });

  console.log('🏪 RetailerForm: Current form data:', {
    businessName: formData.businessName,
    ownerName: formData.ownerName,
    businessType: formData.businessType,
    city: formData.city,
    state: formData.state,
    hasAllRequiredFields: !!(formData.businessName && formData.ownerName && formData.address && formData.city && formData.state)
  });

  const updateField = (field: keyof RetailerFormData, value: string) => {
    console.log('🏪 RetailerForm: Updating field', field, 'with value:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('🏪 RetailerForm: Validating form submission...');
    
    // Validation
    if (!formData.businessName.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया व्यापार का नाम दर्ज करें (Please enter business name)');
      return;
    }
    
    if (!formData.ownerName.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया मालिक का नाम दर्ज करें (Please enter owner name)');
      return;
    }
    
    if (!formData.address.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया पता दर्ज करें (Please enter address)');
      return;
    }
    
    if (!formData.city.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया शहर दर्ज करें (Please enter city)');
      return;
    }
    
    if (!formData.state.trim()) {
      Alert.alert('त्रुटि (Error)', 'कृपया राज्य दर्ज करें (Please enter state)');
      return;
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      Alert.alert('त्रुटि (Error)', 'कृपया वैध पिनकोड दर्ज करें (Please enter valid pincode)');
      return;
    }

    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      Alert.alert('त्रुटि (Error)', 'कृपया वैध GST नंबर दर्ज करें (Please enter valid GST number)');
      return;
    }

    console.log('✅ RetailerForm: Form validation passed, submitting data:', formData);
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.title}>व्यापारी पंजीकरण (Retailer Registration)</Text>
        <Text style={styles.subtitle}>
          कृपया अपनी व्यापारिक जानकारी भरें (Please fill your business information)
        </Text>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>व्यापारिक जानकारी (Business Information)</Text>
          
          <Input
            label="व्यापार का नाम (Business Name) *"
            placeholder="अपने व्यापार का नाम दर्ज करें"
            value={formData.businessName}
            onChangeText={(value) => updateField('businessName', value)}
          />
          
          <Input
            label="मालिक का नाम (Owner Name) *"
            placeholder="मालिक का पूरा नाम दर्ज करें"
            value={formData.ownerName}
            onChangeText={(value) => updateField('ownerName', value)}
          />
          
          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>व्यापार का प्रकार (Business Type):</Text>
            <View style={styles.radioOptions}>
              {[
                { value: 'RETAIL', label: 'खुदरा (Retail)' },
                { value: 'WHOLESALE', label: 'थोक (Wholesale)' },
                { value: 'BOTH', label: 'दोनों (Both)' }
              ].map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  onPress={() => updateField('businessType', option.value)}
                  variant={formData.businessType === option.value ? 'primary' : 'secondary'}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>स्थान की जानकारी (Location Information)</Text>
          
          <Input
            label="पूरा पता (Complete Address) *"
            placeholder="दुकान/गोदाम का पूरा पता दर्ज करें"
            value={formData.address}
            onChangeText={(value) => updateField('address', value)}
          />
          
          <Input
            label="शहर (City) *"
            placeholder="अपना शहर दर्ज करें"
            value={formData.city}
            onChangeText={(value) => updateField('city', value)}
          />
          
          <Input
            label="राज्य (State) *"
            placeholder="अपना राज्य दर्ज करें"
            value={formData.state}
            onChangeText={(value) => updateField('state', value)}
          />
          
          <Input
            label="पिनकोड (Pincode)"
            placeholder="6 अंकों का पिनकोड"
            value={formData.pincode}
            onChangeText={(value) => updateField('pincode', value)}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        {/* Legal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>कानूनी जानकारी (Legal Information)</Text>
          
          <Input
            label="GST नंबर (GST Number)"
            placeholder="15 अंकों का GST नंबर (वैकल्पिक)"
            value={formData.gstNumber}
            onChangeText={(value) => updateField('gstNumber', value.toUpperCase())}
            maxLength={15}
          />
          
          <Input
            label="लाइसेंस नंबर (License Number)"
            placeholder="व्यापारिक लाइसेंस नंबर (वैकल्पिक)"
            value={formData.licenseNumber}
            onChangeText={(value) => updateField('licenseNumber', value)}
          />
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>अतिरिक्त जानकारी (Additional Information)</Text>
          
          <Input
            label="व्यापारिक अनुभव (Business Experience in Years)"
            placeholder="उदाहरण: 5"
            value={formData.experience}
            onChangeText={(value) => updateField('experience', value)}
            keyboardType="numeric"
          />
          
          <Input
            label="विशेषज्ञता (Specialization)"
            placeholder="उदाहरण: अनाज, सब्जी, फल, बीज"
            value={formData.specialization}
            onChangeText={(value) => updateField('specialization', value)}
          />
          
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

export default RetailerForm;
export type { RetailerFormProps };