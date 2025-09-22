// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { weatherService, WeatherData } from '../../services/weatherService';

import WelcomeMessage from '../../components/WelcomeMessage';

const { width } = Dimensions.get('window');

const farmerImages = [
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b6b?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=200&fit=crop',
];

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    loadWeatherData();
    
    // Show welcome message on first load
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 1000);
    
    // Auto-slide farmer images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % farmerImages.length);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const loadWeatherData = async () => {
    try {
      const location = getLocationFromProfile() || 'Delhi, India';
      const weatherData = await weatherService.getCurrentWeather(location);
      setCurrentWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const getLocationFromProfile = (): string | null => {
    if (profile?.farmerProfile) {
      const { village, district, state } = profile.farmerProfile;
      if (village && district) {
        return `${village}, ${district}, ${state || 'India'}`;
      }
      if (district) {
        return `${district}, ${state || 'India'}`;
      }
    }
    if (profile?.retailerProfile) {
      const { city, state } = profile.retailerProfile;
      if (city) {
        return `${city}, ${state || 'India'}`;
      }
    }
    return null;
  };

  const getUserRole = () => {
    return profile?.role?.toLowerCase() || 'farmer';
  };

  const getUserName = () => {
    if (profile?.farmerProfile?.name) {
      return profile.farmerProfile.name;
    }
    if (profile?.retailerProfile?.businessName) {
      return profile.retailerProfile.businessName;
    }
    return 'उपयोगकर्ता';
  };

  const getWelcomeMessage = () => {
    const role = getUserRole();
    const name = getUserName();
    
    if (role === 'farmer') {
      return {
        hindi: `नमस्ते किसान जी, ${name}!`,
        english: `Welcome Farmer, ${name}!`,
      };
    } else {
      return {
        hindi: `नमस्ते व्यापारी जी, ${name}!`,
        english: `Welcome Retailer, ${name}!`,
      };
    }
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'weather-sunny';
    }
    if (conditionLower.includes('cloud')) {
      return 'weather-cloudy';
    }
    if (conditionLower.includes('rain')) {
      return 'weather-rainy';
    }
    return 'weather-partly-cloudy';
  };

  const welcomeMsg = getWelcomeMessage();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTextHindi}>{welcomeMsg.hindi}</Text>
          <Text style={styles.welcomeTextEnglish}>{welcomeMsg.english}</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('hi-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Today's Weather */}
        <View style={styles.weatherCard}>
          <Text style={styles.sectionTitle}>आज का मौसम / Today's Weather</Text>
          
          {weatherLoading ? (
            <View style={styles.weatherLoading}>
              <ActivityIndicator size="small" color="#16a34a" />
              <Text style={styles.loadingText}>मौसम लोड हो रहा है...</Text>
            </View>
          ) : currentWeather ? (
            <View style={styles.weatherContent}>
              <View style={styles.weatherMain}>
                <MaterialCommunityIcons
                  name={getWeatherIcon(currentWeather.current.condition.text)}
                  size={60}
                  color="#16a34a"
                />
                <View style={styles.weatherInfo}>
                  <Text style={styles.temperature}>
                    {Math.round(currentWeather.current.temp_c)}°C
                  </Text>
                  <Text style={styles.weatherCondition}>
                    {currentWeather.current.condition.text}
                  </Text>
                  <Text style={styles.locationText}>
                    📍 {currentWeather.location.name}
                  </Text>
                </View>
              </View>
              
              <View style={styles.weatherStats}>
                <View style={styles.weatherStat}>
                  <MaterialCommunityIcons name="water-percent" size={16} color="#6b7280" />
                  <Text style={styles.statText}>{currentWeather.current.humidity}%</Text>
                  <Text style={styles.statLabel}>नमी</Text>
                </View>
                <View style={styles.weatherStat}>
                  <MaterialCommunityIcons name="weather-windy" size={16} color="#6b7280" />
                  <Text style={styles.statText}>{Math.round(currentWeather.current.wind_kph)}</Text>
                  <Text style={styles.statLabel}>हवा</Text>
                </View>
                <View style={styles.weatherStat}>
                  <MaterialCommunityIcons name="water" size={16} color="#6b7280" />
                  <Text style={styles.statText}>{currentWeather.current.precip_mm}mm</Text>
                  <Text style={styles.statLabel}>बारिश</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>मौसम की जानकारी उपलब्ध नहीं है</Text>
          )}
        </View>

        {/* Farmer Images Slider */}
        <View style={styles.sliderCard}>
          <Text style={styles.sectionTitle}>कृषि गतिविधियां / Farming Activities</Text>
          
          <View style={styles.imageSlider}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
            >
              {farmerImages.map((imageUrl, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.farmerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageText}>
                      {index === 0 && 'खेत की तैयारी / Field Preparation'}
                      {index === 1 && 'बुआई का समय / Sowing Season'}
                      {index === 2 && 'फसल की देखभाल / Crop Care'}
                      {index === 3 && 'कटाई का समय / Harvest Time'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            {/* Slider Indicators */}
            <View style={styles.sliderIndicators}>
              {farmerImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>त्वरित सेवाएं / Quick Services</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <MaterialCommunityIcons name="leaf" size={32} color="#16a34a" />
              <Text style={styles.quickActionText}>फसल रोग</Text>
              <Text style={styles.quickActionSubtext}>Crop Disease</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <MaterialCommunityIcons name="weather-cloudy" size={32} color="#3b82f6" />
              <Text style={styles.quickActionText}>मौसम</Text>
              <Text style={styles.quickActionSubtext}>Weather</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <MaterialCommunityIcons name="wallet" size={32} color="#f59e0b" />
              <Text style={styles.quickActionText}>वॉलेट</Text>
              <Text style={styles.quickActionSubtext}>Wallet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <MaterialCommunityIcons name="storefront" size={32} color="#8b5cf6" />
              <Text style={styles.quickActionText}>बाजार</Text>
              <Text style={styles.quickActionSubtext}>Market</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>आज के सुझाव / Today's Tips</Text>
          
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#f59e0b" />
            <Text style={styles.tipText}>
              आज का मौसम सिंचाई के लिए उपयुक्त है। सुबह या शाम के समय पानी दें।
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#f59e0b" />
            <Text style={styles.tipText}>
              Today's weather is suitable for irrigation. Water in morning or evening.
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#16a34a" />
            <Text style={styles.tipText}>
              गेहूं की कीमत में वृद्धि हो रही है। बेचने का अच्छा समय है।
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Welcome Message */}
      <WelcomeMessage
        visible={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  welcomeHeader: {
    backgroundColor: 'rgba(22, 163, 74, 0.95)',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeTextHindi: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  welcomeTextEnglish: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  weatherCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    backdropFilter: 'blur(20px)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
  },
  weatherContent: {
    // Weather content styles
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherInfo: {
    marginLeft: 16,
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  weatherStat: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  errorText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 20,
  },
  sliderCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
  },
  imageSlider: {
    height: 200,
  },
  imageContainer: {
    width: width - 32,
    height: 200,
    position: 'relative',
  },
  farmerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  imageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sliderIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#16a34a',
  },
  quickActionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    backdropFilter: 'blur(20px)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  quickActionSubtext: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 120, // Extra space for floating AI button
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    backdropFilter: 'blur(20px)',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
