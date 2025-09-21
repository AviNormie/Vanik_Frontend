import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';


const { width, height } = Dimensions.get('window');

// Types
interface ImageAsset {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

interface PredictionResult {
  prediction: string;
  confidence: number;
  gemini_solution: string;
}

const CropDiseaseApp: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const showImagePicker = (): void => {
    Alert.alert(
      'फोटो चुनें',
      'आप अपनी फसल की तस्वीर कैसे लेना चाहते हैं?',
      [
        {
          text: '📷 कैमरा खोलें',
          onPress: openCamera,
        },
        {
          text: '📁 गैलरी से चुनें',
          onPress: openGallery,
        },
        {
          text: 'रद्द करें',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async (): Promise<void> => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('अनुमति आवश्यक', 'कैमरा उपयोग के लिए अनुमति दें');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          fileName: `crop_${Date.now()}.jpg`,
        });
        setResult(null);
      }
    } catch (error) {
      Alert.alert('त्रुटि', 'कैमरा खोलने में समस्या हुई');
    }
  };

  const openGallery = async (): Promise<void> => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('अनुमति आवश्यक', 'गैलरी उपयोग के लिए अनुमति दें');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          fileName: `crop_${Date.now()}.jpg`,
        });
        setResult(null);
      }
    } catch (error) {
      Alert.alert('त्रुटि', 'गैलरी खोलने में समस्या हुई');
    }
  };

  const uploadAndPredict = async (): Promise<void> => {
    if (!selectedImage) {
      Alert.alert('चेतावनी', 'कृपया पहले एक तस्वीर चुनें');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        name: selectedImage.fileName || 'crop_image.jpg',
      } as any);

      const response = await fetch('https://602bdb2ee46b.ngrok-free.app/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'त्रुटि', 
        'तस्वीर का विश्लेषण नहीं हो सका। कृपया दोबारा कोशिश करें।\n\nसुझाव:\n• इंटरनेट कनेक्शन जांचें\n• तस्वीर का साइज़ कम करें\n• कुछ देर बाद कोशिश करें'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner: React.FC = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#22c55e" />
      <Text style={styles.loadingText}>
        आपकी फसल का विश्लेषण हो रहा है...
      </Text>
      <Text style={styles.loadingSubText}>
        कृपया प्रतीक्षा करें, AI तकनीक से जांच की जा रही है
      </Text>
    </View>
  );

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#22c55e';
    if (confidence >= 0.6) return '#eab308';
    return '#ef4444';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return 'उच्च विश्वसनीयता';
    if (confidence >= 0.6) return 'मध्यम विश्वसनीयता';
    return 'कम विश्वसनीयता';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#15803d" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.headerTitle}>
            🌱 फसल डॉक्टर
          </Text>
          <Text style={styles.headerSubtitle}>
            AI से फसल रोग की पहचान
          </Text>
        </Animated.View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Image Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📸 फसल की तस्वीर लें
          </Text>
          
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={showImagePicker}
              >
                <Text style={styles.changeImageButtonText}>
                  तस्वीर बदलें
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={showImagePicker}
            >
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderTitle}>
                तस्वीर लेने के लिए यहाँ दबाएं
              </Text>
              <Text style={styles.placeholderSubtitle}>
                कैमरा या गैलरी से चुनें
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Button */}
        {selectedImage && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.analyzeButton, isLoading && styles.disabledButton]}
              onPress={uploadAndPredict}
              disabled={isLoading}
            >
              <View style={[styles.analyzeButtonGradient, isLoading && styles.disabledButtonGradient]}>
                <Text style={styles.analyzeButtonText}>
                  {isLoading ? '🔍 जांच हो रही है...' : '🔬 फसल की जांच करें'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Animation */}
        {isLoading && <LoadingSpinner />}

        {/* Results Section */}
        {result && !isLoading && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📊 जांच परिणाम
            </Text>
            
            <View style={styles.resultCard}>
              {/* Disease Prediction */}
              <View style={styles.predictionContainer}>
                <Text style={styles.predictionLabel}>रोग की पहचान:</Text>
                <Text style={styles.predictionValue}>
                  {result.prediction}
                </Text>
              </View>
              
              {/* Confidence Level */}
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>विश्वसनीयता स्तर:</Text>
                <View style={styles.confidenceBarContainer}>
                  <View style={styles.confidenceBarBackground}>
                    <View
                      style={[
                        styles.confidenceBarFill,
                        { 
                          width: `${(result.confidence || 0) * 100}%`,
                          backgroundColor: getConfidenceColor(result.confidence || 0)
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.confidencePercentage}>
                    {((result.confidence || 0) * 100).toFixed(1)}%
                  </Text>
                </View>
                <Text style={[
                  styles.confidenceText,
                  { color: getConfidenceColor(result.confidence || 0) }
                ]}>
                  {getConfidenceText(result.confidence || 0)}
                </Text>
              </View>
              
              {/* AI Solution */}
              {result.gemini_solution && (
                <View style={styles.solutionContainer}>
                  <Text style={styles.solutionTitle}>
                    🧠 AI सुझाव और उपाय:
                  </Text>
                  <Text style={styles.solutionText}>
                    {result.gemini_solution}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💡 बेहतर तस्वीर के लिए सुझाव
          </Text>
          <View style={styles.tipsCard}>
            <Text style={styles.tipItem}>• पर्याप्त रोशनी में तस्वीर लें</Text>
            <Text style={styles.tipItem}>• रोग वाले हिस्से पर फोकस करें</Text>
            <Text style={styles.tipItem}>• पास से स्पष्ट तस्वीर लें</Text>
            <Text style={styles.tipItem}>• फोन को स्थिर रखें</Text>
            <Text style={styles.tipItem}>• पत्तियों की दोनों तरफ दिखाएं</Text>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>
              🚨 आपातकालीन सहायता
            </Text>
            <Text style={styles.emergencyText}>
              गंभीर समस्या के लिए तुरंत स्थानीय कृषि विशेषज्ञ से संपर्क करें
            </Text>
            <Text style={styles.emergencyHelpline}>
              हेल्पलाइन: 1800-180-1551 (किसान कॉल सेंटर)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#bbf7d0',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: width - 60,
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
  },
  changeImageButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeImageButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePlaceholder: {
    width: width - 60,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#4ade80',
    borderStyle: 'dashed',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    color: '#15803d',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#16a34a',
    textAlign: 'center',
  },
  analyzeButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonGradient: {
    backgroundColor: '#22c55e',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButtonGradient: {
    backgroundColor: '#9ca3af',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 18,
    color: '#15803d',
    marginTop: 16,
    fontWeight: '500',
  },
  loadingSubText: {
    fontSize: 14,
    color: '#16a34a',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  predictionContainer: {
    marginBottom: 24,
  },
  predictionLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
  },
  confidenceContainer: {
    marginBottom: 24,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  confidenceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  confidenceBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginRight: 12,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  confidencePercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    minWidth: 50,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  solutionContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4ade80',
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  solutionText: {
    fontSize: 16,
    color: '#15803d',
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    fontSize: 16,
    color: '#15803d',
    marginBottom: 12,
    lineHeight: 22,
  },
  emergencyCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 16,
    padding: 24,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 16,
    color: '#a16207',
    marginBottom: 8,
    lineHeight: 22,
  },
  emergencyHelpline: {
    fontSize: 14,
    color: '#a16207',
    fontWeight: '500',
  },
});

export default CropDiseaseApp;