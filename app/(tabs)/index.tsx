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
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Stack } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { weatherService, WeatherData } from '../../services/weatherService';

import WelcomeMessage from '../../components/WelcomeMessage';

const { width } = Dimensions.get('window');

const farmerImages = [
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b6b?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=200&fit=crop',
];

// Hero background image - you can replace this with your preferred image
const HERO_BG = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
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
    return 'Jonathan.S';
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

  const mockWeeklyWeather = [
    { day: '09', date: 'Mon', temp: '28°', icon: 'weather-cloudy' },
    { day: '10', date: 'Tue', temp: '30°', icon: 'weather-partly-cloudy' },
    { day: '11', date: 'Wed', temp: '32°', icon: 'weather-sunny', active: true },
    { day: '12', date: 'Thu', temp: '34°', icon: 'weather-partly-cloudy' },
    { day: '13', date: 'Fri', temp: '35°', icon: 'weather-sunny' },
    { day: '14', date: 'Sat', temp: '34°', icon: 'weather-sunny' },
  ];

  const welcomeMsg = getWelcomeMessage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Hero Section */}
          <ImageBackground 
            source={{ uri: HERO_BG }} 
            style={styles.heroSection}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.greetingText}>Hello {getUserName()}</Text>
                  <Text style={styles.timeText}>
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                  <Text style={styles.dateHeaderText}>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {/* Main Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Farming Made Simple,</Text>
                <Text style={styles.mainTitle}>Smarter, and Sustainable</Text>
              </View>

            
            </View>
          </ImageBackground>

          {/* Weather Section */}
          <View style={styles.weatherSection}>
            <ImageBackground 
              source={{ uri: 'https://images.unsplash.com/photo-1546721435-666d5f9a5676?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fGNyb3BzfGVufDB8fDB8fHwy' }}
              style={styles.weatherBgImage}
              imageStyle={styles.weatherBgImageStyle}
            >
              <View style={styles.weatherContainer}>
                {/* Current Weather Card */}
                <View style={styles.currentWeatherCard}>
                  <View style={styles.currentWeatherMain}>
                    <View style={styles.currentWeatherLeft}>
                      <Text style={styles.currentDate}>
                        {new Date().toLocaleDateString('en-US', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                      {weatherLoading ? (
                        <ActivityIndicator size="large" color="#ff6b35" />
                      ) : currentWeather ? (
                        <Text style={styles.currentTemp}>{Math.round(currentWeather.current.temp_c)}°C</Text>
                      ) : (
                        <Text style={styles.currentTemp}>33°C</Text>
                      )}
                      <View style={styles.weatherDescriptionRow}>
                        <MaterialCommunityIcons 
                          name={currentWeather ? getWeatherIcon(currentWeather.current.condition.text) : "weather-sunny"} 
                          size={16} 
                          color="#ff6b35" 
                        />
                        <Text style={styles.weatherDescription}>
                          {currentWeather ? currentWeather.current.condition.text : "Bright and Sunny"}
                        </Text>
                      </View>
                      <View style={styles.weatherAdviceRow}>
                        <MaterialCommunityIcons name="leaf" size={16} color="#16a34a" />
                        <Text style={styles.weatherAdvice}>Suitable for plant growth</Text>
                      </View>
                    </View>
                    <View style={styles.currentWeatherRight}>
                      <Text style={styles.weatherLabel}>Weather</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Crop Categories */}
          <View style={styles.cropCategoriesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={[styles.cropCategory, styles.activeCropCategory]}>
                <Text style={[styles.cropCategoryText, styles.activeCropCategoryText]}>🌾 Wheat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropCategory}>
                <Text style={styles.cropCategoryText}>🌾 Grains</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropCategory}>
                <Text style={styles.cropCategoryText}>🥔 Potato</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropCategory}>
                <Text style={styles.cropCategoryText}>🌽 Corn</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* My Fields Section */}
          <View style={styles.myFieldsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Fields</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldCard}>
              <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=200&fit=crop' }}
                style={styles.fieldImageBg}
                imageStyle={styles.fieldImage}
              >
                <View style={styles.fieldOverlay}>
                  <View style={styles.fieldHeader}>
                    <View style={styles.fieldRating}>
                      <Text style={styles.fieldRatingText}>⭐ 4.5</Text>
                    </View>
                    <TouchableOpacity style={styles.fieldFavorite}>
                      <MaterialCommunityIcons name="heart" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.fieldFooter}>
                    <View style={styles.fieldLocation}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#fff" />
                      <Text style={styles.fieldLocationText}>140-7380 (North) | PLDGI6 (West)</Text>
                    </View>
                    <Text style={styles.fieldName}>Emerald Valley Plot F5</Text>
                    <TouchableOpacity style={styles.fieldActionButton}>
                      <MaterialCommunityIcons name="arrow-top-right" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </View>
          </View>

          {/* Quick Actions - keeping your original functionality */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.sectionTitleOriginal}>{t('quickServices')}</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction}>
                <MaterialCommunityIcons name="leaf" size={32} color="#16a34a" />
                <Text style={styles.quickActionText}>{t('cropDisease')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <MaterialCommunityIcons name="weather-cloudy" size={32} color="#3b82f6" />
                <Text style={styles.quickActionText}>{t('weather')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <MaterialCommunityIcons name="wallet" size={32} color="#f59e0b" />
                <Text style={styles.quickActionText}>{t('wallet')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <MaterialCommunityIcons name="storefront" size={32} color="#8b5cf6" />
                <Text style={styles.quickActionText}>{t('market')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips Section - keeping your original functionality */}
          <View style={styles.tipsCard}>
            <Text style={styles.sectionTitleOriginal}>{t('todayTips')}</Text>
            
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#f59e0b" />
              <Text style={styles.tipText}>
                {t('irrigationTip')}
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#16a34a" />
              <Text style={styles.tipText}>
                {t('wheatPriceTip')}
              </Text>
            </View>
          </View>

        </ScrollView>

        {/* Welcome Message - keeping your original functionality */}
        <WelcomeMessage
          visible={showWelcome}
          onClose={() => setShowWelcome(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section Styles
  heroSection: {
    height: 350,
    position: 'relative',
    
  },
  heroImage: {
    resizeMode: 'cover',
    borderRadius: 40,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    paddingTop: 50,
    borderRadius: 40,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 12,
  },
  headerLeft: {
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    marginTop: 10,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  dateHeaderText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  // Title Styles
  titleContainer: {
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 32,
    textAlign: 'center',
  },
  
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:'#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 'auto',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  
  // Weather Section Styles
  weatherSection: {
    marginTop: -100,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  weatherBgImage: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  weatherBgImageStyle: {
    borderRadius: 20,
    opacity: 0.9,
  },
  weatherContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 12,
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  weeklyWeatherScroll: {
    marginBottom: 12,
    alignItems: 'center',
  },
  weatherDayCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 6,
    borderRadius: 16,
    minWidth: 50,
    backgroundColor: '#1a1a1a',
  },
  activeWeatherCard: {
    backgroundColor: '#1a1a1a',
  },
  weatherDayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  weatherDayName: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },
  weatherDayIcon: {
    marginBottom: 6,
  },
  weatherDayTemp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  activeWeatherText: {
    color: '#fff',
  },
  
  // Current Weather Card
  currentWeatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  currentWeatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  currentWeatherLeft: {
    flex: 1,
  },
  currentDate: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  currentTemp: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  weatherDescriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  weatherDescription: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  weatherAdviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherAdvice: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  currentWeatherRight: {
    alignItems: 'flex-end',
  },
  weatherLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  // Crop Categories
  cropCategoriesSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
  },
  cropCategory: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  activeCropCategory: {
    backgroundColor: '#ff6b35',
  },
  cropCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeCropCategoryText: {
    color: '#fff',
  },
  
  // My Fields Section
  myFieldsSection: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#ff6b35',
    fontWeight: '600',
  },
  fieldCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  fieldImageBg: {
    flex: 1,
  },
  fieldImage: {
    resizeMode: 'cover',
  },
  fieldOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    justifyContent: 'space-between',
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldRating: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  fieldRatingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  fieldFavorite: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 15,
  },
  fieldFooter: {
    position: 'relative',
  },
  fieldLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLocationText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  fieldName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  fieldActionButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 15,
  },

  // Glass Effect Containers
  quickActionsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  sectionTitleOriginal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
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
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  tipsCard: {
    margin: 16,
    marginBottom: 120,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
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
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});