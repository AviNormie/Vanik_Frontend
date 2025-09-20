// ]pp/(tabs)/settings.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../components/ui/Card';
import LogoutButton from '../../components/shared/LogoutButton';

export default function SettingsScreen() {

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.sectionTitle}>
          ऐप सेटिंग्स (App Settings)
        </Text>
        
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>भाषा (Language)</Text>
            <Text style={styles.settingValue}>हिंदी/English</Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>सूचनाएं (Notifications)</Text>
            <Text style={styles.settingValueActive}>चालू (On)</Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>ऐप वर्जन (App Version)</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>
          सहायता (Support)
        </Text>
        
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>• हेल्पलाइन: 1800-XXX-XXXX</Text>
          <Text style={styles.supportText}>• ईमेल: support@agrotech.com</Text>
          <Text style={styles.supportText}>• सप्ताह के सभी दिन उपलब्ध</Text>
        </View>
      </Card>

      <View style={styles.logoutContainer}>
        <LogoutButton
          title="लॉगआउट (Logout)"
          variant="danger"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  settingsContainer: {
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#374151',
    fontSize: 16,
  },
  settingValue: {
    color: '#6b7280',
    fontSize: 16,
  },
  settingValueActive: {
    color: '#16a34a',
    fontSize: 16,
  },
  supportContainer: {
    gap: 12,
  },
  supportText: {
    color: '#4b5563',
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 24,
  },
});
