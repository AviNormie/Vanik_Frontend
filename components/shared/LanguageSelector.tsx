import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');

type Language = 'hindi' | 'english' | 'malayalam';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'english', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
];

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const getCurrentLanguageOption = () => {
    return languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];
  };

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    setModalVisible(false);
  };

  const currentLang = getCurrentLanguageOption();

  return (
    <>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flagText}>{currentLang.flag}</Text>
        <MaterialCommunityIcons name="chevron-down" size={16} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.languageList}>
              {languageOptions.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === language.code && styles.selectedLanguageOption,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <View style={styles.languageNames}>
                      <Text style={[
                        styles.languageName,
                        currentLanguage === language.code && styles.selectedLanguageName,
                      ]}>
                        {language.name}
                      </Text>
                      <Text style={[
                        styles.languageNativeName,
                        currentLanguage === language.code && styles.selectedLanguageNativeName,
                      ]}>
                        {language.nativeName}
                      </Text>
                    </View>
                  </View>
                  {currentLanguage === language.code && (
                    <MaterialCommunityIcons name="check" size={20} color="#16a34a" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  flagText: {
    fontSize: 16,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    padding: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  selectedLanguageOption: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'System',
  },
  selectedLanguageName: {
    color: '#16a34a',
    fontWeight: '600',
  },
  languageNativeName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'System',
  },
  selectedLanguageNativeName: {
    color: '#16a34a',
  },
});