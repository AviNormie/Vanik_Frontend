
import React, { useState, useEffect } from 'react';
import {
View,
Text,
ScrollView,
StyleSheet,
ActivityIndicator,
Dimensions,
TouchableOpacity,
RefreshControl,
ImageBackground,
StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { weatherService, WeatherData, ForecastData } from '../../services/weatherService';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function WeatherScreen() {
const { profile } = useAuth();
const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
const [forecast, setForecast] = useState<ForecastData | null>(null);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [selectedDay, setSelectedDay] = useState(0);

useEffect(() => {
  loadWeatherData();
}, []);

const loadWeatherData = async () => {
  try {
    setLoading(true);
    
    // Get location from user profile or use fallback
    const location = getLocationFromProfile() || 'Delhi, India';
    
    const [weatherData, forecastData] = await Promise.all([
      weatherService.getCurrentWeather(location),
      weatherService.getWeatherForecast(location, 7),
    ]);
    
    setCurrentWeather(weatherData);
    setForecast(forecastData);
  } catch (error) {
    console.error('Error loading weather data:', error);
  } finally {
    setLoading(false);
  }
};

const onRefresh = async () => {
  setRefreshing(true);
  await loadWeatherData();
  setRefreshing(false);
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
  if (conditionLower.includes('storm')) {
    return 'weather-lightning';
  }
  if (conditionLower.includes('snow')) {
    return 'weather-snowy';
  }
  return 'weather-partly-cloudy';
};

const getTemperatureChartData = () => {
  if (!forecast) return null;
  
  const labels = forecast.forecast.forecastday.map(day => {
    const date = new Date(day.date);
    return date.toLocaleDateString('en', { weekday: 'short' });
  });
  
  const maxTemps = forecast.forecast.forecastday.map(day => day.day.maxtemp_c);
  const minTemps = forecast.forecast.forecastday.map(day => day.day.mintemp_c);
  
  return {
    labels,
    datasets: [
      {
        data: maxTemps,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: minTemps,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };
};

const getHumidityChartData = () => {
  if (!forecast) return null;
  
  const labels = forecast.forecast.forecastday.map(day => {
    const date = new Date(day.date);
    return date.toLocaleDateString('en', { weekday: 'short' });
  });
  
  const humidity = forecast.forecast.forecastday.map(day => day.day.avghumidity);
  
  return {
    labels,
    datasets: [
      {
        data: humidity,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };
};

if (loading) {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1589746163901-e7b6c5ca48e5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGhpbGx5JTIwY3JvcCUyMGZpZWxkc3xlbnwwfHwwfHx8Mg%3D%3D' }}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>मौसम की जानकारी लोड हो रही है...</Text>
        <Text style={styles.loadingSubtext}>Loading weather information...</Text>
      </LinearGradient>
    </ImageBackground>
  );
}

return (

  <View style={styles.container}>
       <Stack.Screen options={{ headerShown: false }} />
    <StatusBar barStyle="light-content" />
    
    {/* Top Section with Background Image */}
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1589746163901-e7b6c5ca48e5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGhpbGx5JTIwY3JvcCUyMGZpZWxkc3xlbnwwfHwwfHx8Mg%3D%3D' }}
      style={styles.headerBackgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          {currentWeather && (
            <View style={styles.headerSection}>
              <View style={styles.locationHeader}>
                <MaterialCommunityIcons name="map-marker" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationText}>
                  {currentWeather.location.name}, {currentWeather.location.region}
                </Text>
              </View>
              
              <Text style={styles.greetingText}>Hi, Good Morning ☀️</Text>
              
              <View style={styles.currentTempSection}>
                <Text style={styles.mainTemperature}>
                  {Math.round(currentWeather.current.temp_c)}°C
                </Text>
                <View style={styles.weatherConditionRow}>
                  <MaterialCommunityIcons
                    name={getWeatherIcon(currentWeather.current.condition.text)}
                    size={24}
                    color="white"
                  />
                  <Text style={styles.weatherCondition}>
                    {currentWeather.current.condition.text}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateTime}>
                {new Date().toLocaleTimeString('en', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })} | {new Date().toLocaleDateString('en', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>

              {/* Current Weather Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <MaterialCommunityIcons name="weather-windy" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.quickStatText}>
                    {Math.round(currentWeather.current.wind_kph)} km/h
                  </Text>
                </View>
                <View style={styles.quickStatItem}>
                  <MaterialCommunityIcons name="water-percent" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.quickStatText}>
                    {currentWeather.current.humidity}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>

    {/* Bottom White Container with All Other Components */}
    <ScrollView
      style={styles.whiteContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#666666"
        />
      }
      showsVerticalScrollIndicator={false}
    >
  
      {/* Agriculture Field Section */}
      <View style={styles.fieldSection}>
        <View style={styles.fieldHeader}>
          <Text style={styles.sectionTitle}>Our agriculture field</Text>
          <TouchableOpacity>
            <Text style={styles.viewMapText}>View Map</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.fieldCard}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }}
            style={styles.fieldImage}
            imageStyle={styles.fieldImageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.fieldGradient}
            >
              <Text style={styles.fieldName}>Rice Field Premium Plot R8...</Text>
              <Text style={styles.fieldCoordinates}>
                74°7'44.1"S, 110°2'40.9"E
              </Text>
              <View style={styles.harvestBadge}>
                <Text style={styles.harvestText}>Towards Harvest</Text>
              </View>
              
              <View style={styles.fieldStats}>
                <View style={styles.fieldStatItem}>
                  <MaterialCommunityIcons name="resize" size={16} color="white" />
                  <Text style={styles.fieldStatText}>6.2 ha</Text>
                </View>
                <View style={styles.fieldStatItem}>
                  <MaterialCommunityIcons name="chart-line" size={16} color="white" />
                  <Text style={styles.fieldStatText}>12 Activity</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>
      </View>

      {/* Hourly Weather */}
      {currentWeather && (
        <View style={styles.hourlyWeatherSection}>
          <View style={styles.tempRangeContainer}>
            <Text style={styles.tempRangeTitle}>28°c</Text>
            <View style={styles.tempRangeBar}>
              <LinearGradient
                colors={['#4ade80', '#fbbf24', '#f59e0b', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tempGradientBar}
              />
              <View style={styles.tempIndicator} />
            </View>
            <View style={styles.tempLabels}>
              <Text style={styles.tempLabel}>25°</Text>
              <Text style={styles.tempLabel}>26°</Text>
              <Text style={styles.tempLabel}>27°</Text>
              <Text style={styles.tempLabel}>28°</Text>
              <Text style={styles.tempLabel}>30°</Text>
              <Text style={styles.tempLabel}>31°</Text>
            </View>
            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>09 AM</Text>
              <Text style={styles.timeLabel}>10 AM</Text>
              <Text style={styles.timeLabel}>12 PM</Text>
              <Text style={styles.timeLabel}>01 PM</Text>
              <Text style={styles.timeLabel}>02 PM</Text>
            </View>
          </View>
        </View>
      )}

      {/* Weather Stats Grid */}
      {currentWeather && (
        <View style={styles.modernStatsGrid}>
          {/* UV Index Card */}
          <View style={[styles.modernStatCard, styles.uvCard]}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="white-balance-sunny" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.modernStatLabel}>Uv Index</Text>
            </View>
            <Text style={styles.modernStatValue}>05</Text>
            <View style={styles.uvChart}>
              <View style={styles.uvWave} />
            </View>
          </View>

          {/* Humidity Card */}
          <View style={[styles.modernStatCard, styles.humidityCard]}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="water-percent" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.modernStatLabel}>Humidity</Text>
            </View>
            <Text style={styles.modernStatValue}>{currentWeather.current.humidity}%</Text>
            <View style={styles.humidityChart}>
              <View style={styles.humidityWave} />
            </View>
          </View>

          {/* Wind Speed Card */}
          <View style={[styles.modernStatCard, styles.windCard]}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="weather-windy" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.modernStatLabel}>Wind Speed</Text>
            </View>
            <Text style={styles.modernStatValue}>{Math.round(currentWeather.current.wind_kph)}</Text>
            <Text style={styles.windUnit}>km/h</Text>
          </View>

          {/* Pressure Card */}
          <View style={[styles.modernStatCard, styles.pressureCard]}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="gauge" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.modernStatLabel}>Pressure</Text>
            </View>
            <Text style={styles.modernStatValue}>{Math.round(currentWeather.current.pressure_mb / 10)}</Text>
            <Text style={styles.pressureUnit}>hPa</Text>
          </View>
        </View>
      )}

      {/* 7-Day Weather Forecast Graph */}
      {forecast && (
        <View style={styles.forecastSection}>
          <Text style={styles.sectionTitle}>
            7 दिन का मौसम पूर्वानुमान / 7-Day Weather Forecast
          </Text>
          
          {/* Weather Graph Container */}
          <View style={styles.weatherGraphContainer}>
            {/* Graph Lines */}
            <View style={styles.graphGrid}>
              {[...Array(4)].map((_, i) => (
                <View key={i} style={styles.gridLine} />
              ))}
            </View>
            
            {/* Temperature Graph Line */}
            <View style={styles.tempGraphLine}>
              <LinearGradient
                colors={['#4ade80', '#fbbf24', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tempLineGradient}
              />
            </View>
            
            {/* Weather Data Points */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherDataScroll}>
              {forecast.forecast.forecastday.map((day, index) => {
                const maxTemp = Math.round(day.day.maxtemp_c);
                const minTemp = Math.round(day.day.mintemp_c);
                const tempRange = 40 - 15; // Assuming range from 15°C to 40°C
                const maxTempPosition = ((maxTemp - 15) / tempRange) * 100;
                const minTempPosition = ((minTemp - 15) / tempRange) * 100;
                
                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.weatherDataPoint,
                      selectedDay === index && styles.selectedDataPoint,
                    ]}
                    onPress={() => setSelectedDay(index)}
                  >
                    {/* Temperature Points */}
                    <View style={[styles.tempPoint, styles.maxTempPoint, { bottom: `${maxTempPosition}%` }]}>
                      <Text style={styles.tempPointText}>{maxTemp}°</Text>
                    </View>
                    <View style={[styles.tempPoint, styles.minTempPoint, { bottom: `${minTempPosition}%` }]}>
                      <Text style={styles.tempPointText}>{minTemp}°</Text>
                    </View>
                    
                    {/* Connecting Line */}
                    <View 
                      style={[
                        styles.connectingLine,
                        {
                          bottom: `${minTempPosition}%`,
                          height: `${maxTempPosition - minTempPosition}%`
                        }
                      ]}
                    />
                    
                    {/* Day Information */}
                    <View style={styles.dayInfo}>
                      <Text style={styles.dayName}>
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </Text>
                      <MaterialCommunityIcons
                        name={getWeatherIcon(day.day.condition.text)}
                        size={24}
                        color="#4ade80"
                      />
                      <Text style={styles.weatherConditionText}>
                        {day.day.condition.text.length > 8 
                          ? day.day.condition.text.substring(0, 8) + '...'
                          : day.day.condition.text
                        }
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          
          {/* Weather Summary Cards */}
          <View style={styles.weatherSummaryCards}>
            <View style={styles.summaryCard}>
              <MaterialCommunityIcons name="thermometer-high" size={20} color="#ef4444" />
              <Text style={styles.summaryLabel}>Avg High</Text>
              <Text style={styles.summaryValue}>
                {Math.round(forecast.forecast.forecastday.reduce((sum, day) => sum + day.day.maxtemp_c, 0) / forecast.forecast.forecastday.length)}°C
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <MaterialCommunityIcons name="thermometer-low" size={20} color="#3b82f6" />
              <Text style={styles.summaryLabel}>Avg Low</Text>
              <Text style={styles.summaryValue}>
                {Math.round(forecast.forecast.forecastday.reduce((sum, day) => sum + day.day.mintemp_c, 0) / forecast.forecast.forecastday.length)}°C
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <MaterialCommunityIcons name="weather-rainy" size={20} color="#06b6d4" />
              <Text style={styles.summaryLabel}>Rain Days</Text>
              <Text style={styles.summaryValue}>
                {forecast.forecast.forecastday.filter(day => day.day.totalprecip_mm > 0).length}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Temperature Chart */}
      {getTemperatureChartData() && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>
            तापमान का ग्राफ / Temperature Chart
          </Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#4ade80" />
            <Text style={styles.chartPlaceholderText}>
              तापमान चार्ट / Temperature Chart
            </Text>
            <Text style={styles.chartDataText}>
              {getTemperatureChartData()?.labels.map((label, index) => (
                `${label}: ${Math.round(getTemperatureChartData()?.datasets[0].data[index] || 0)}°C`
              )).join(' • ')}
            </Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>अधिकतम तापमान / Max Temp</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>न्यूनतम तापमान / Min Temp</Text>
            </View>
          </View>
        </View>
      )}

      {/* Humidity Chart */}
      {getHumidityChartData() && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>
            नमी का ग्राफ / Humidity Chart
          </Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="water-percent" size={48} color="#4ade80" />
            <Text style={styles.chartPlaceholderText}>
              नमी चार्ट / Humidity Chart
            </Text>
            <Text style={styles.chartDataText}>
              {getHumidityChartData()?.labels.map((label, index) => (
                `${label}: ${Math.round(getHumidityChartData()?.datasets[0].data[index] || 0)}%`
              )).join(' • ')}
            </Text>
          </View>
        </View>
      )}

      {/* Detailed Day View */}
      {forecast && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>
            विस्तृत जानकारी / Detailed Information
          </Text>
          <Text style={styles.detailDate}>
            {new Date(forecast.forecast.forecastday[selectedDay].date).toLocaleDateString('hi', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          <View style={styles.detailStats}>
            <View style={styles.detailStatItem}>
              <MaterialCommunityIcons name="thermometer" size={24} color="#4ade80" />
              <Text style={styles.detailStatLabel}>तापमान / Temperature</Text>
              <Text style={styles.detailStatValue}>
                {Math.round(forecast.forecast.forecastday[selectedDay].day.maxtemp_c)}° / {Math.round(forecast.forecast.forecastday[selectedDay].day.mintemp_c)}°
              </Text>
            </View>
            
            <View style={styles.detailStatItem}>
              <MaterialCommunityIcons name="water-percent" size={24} color="#4ade80" />
              <Text style={styles.detailStatLabel}>नमी / Humidity</Text>
              <Text style={styles.detailStatValue}>
                {forecast.forecast.forecastday[selectedDay].day.avghumidity}%
              </Text>
            </View>
            
            <View style={styles.detailStatItem}>
              <MaterialCommunityIcons name="weather-windy" size={24} color="#4ade80" />
              <Text style={styles.detailStatLabel}>हवा / Wind</Text>
              <Text style={styles.detailStatValue}>
                {Math.round(forecast.forecast.forecastday[selectedDay].day.maxwind_kph)} km/h
              </Text>
            </View>
            
            <View style={styles.detailStatItem}>
              <MaterialCommunityIcons name="water" size={24} color="#4ade80" />
              <Text style={styles.detailStatLabel}>बारिश / Rain</Text>
              <Text style={styles.detailStatValue}>
                {forecast.forecast.forecastday[selectedDay].day.totalprecip_mm} mm
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Farming Tips */}
      <View style={[styles.tipsSection, styles.lastCard]}>
        <Text style={styles.sectionTitle}>
          कृषि सुझाव / Farming Tips
        </Text>
        
        <View style={styles.tipItem}>
          <MaterialCommunityIcons name="lightbulb" size={20} color="#f59e0b" />
          <Text style={styles.tipText}>
            आज का मौसम फसल की सिंचाई के लिए उपयुक्त है।
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <MaterialCommunityIcons name="lightbulb" size={20} color="#f59e0b" />
          <Text style={styles.tipText}>
            Today's weather is suitable for crop irrigation.
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <MaterialCommunityIcons name="alert" size={20} color="#ef4444" />
          <Text style={styles.tipText}>
            अगले 3 दिनों में बारिश की संभावना है, कटाई की योजना बनाएं।
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <MaterialCommunityIcons name="alert" size={20} color="#ef4444" />
          <Text style={styles.tipText}>
            Rain expected in next 3 days, plan your harvest accordingly.
          </Text>
        </View>
      </View>

      {/* Bottom Navigation Space */}
      <View style={styles.bottomNavSpace} />
    </ScrollView>

    {/* Bottom Navigation */}
    <View style={styles.bottomNav}>
      <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
        <View style={styles.navIconContainer}>
          <MaterialCommunityIcons name="home" size={24} color="#ffffff" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <MaterialCommunityIcons name="pause" size={24} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <MaterialCommunityIcons name="stop" size={24} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <MaterialCommunityIcons name="chart-bar" size={24} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <MaterialCommunityIcons name="account" size={24} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </View>
  </View>
 
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#1a1a1a',
},
// Header Section with Background Image
headerBackgroundImage: {
  height: height * 0.38, // Adjust height as needed
  width: '100%',
},
headerGradient: {
  flex: 1,
},
headerSafeArea: {
  flex: 1,
  paddingTop: 20,
},
headerSection: {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 30,
},
locationHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
locationText: {
  marginLeft: 6,
  fontSize: 14,
  color: 'rgba(255,255,255,0.8)',
  fontWeight: '500',
},
greetingText: {
  fontSize: 18,
  fontWeight: '600',
  color: '#ffffff',
  marginBottom: 16,
},
currentTempSection: {
  alignItems: 'flex-start',
  marginBottom: 12,
},
mainTemperature: {
  fontSize: 72,
  fontWeight: 'bold',
  color: '#ffffff',
  lineHeight: 80,
},
weatherConditionRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: -8,
},
weatherCondition: {
  fontSize: 18,
  color: '#ffffff',
  marginLeft: 8,
  fontWeight: '500',
},
dateTime: {
  fontSize: 14,
  color: 'rgba(255,255,255,0.7)',
  marginBottom: 16,
},
quickStats: {
  flexDirection: 'row',
  gap: 20,
},
quickStatItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
quickStatText: {
  color: 'rgba(255,255,255,0.8)',
  fontSize: 14,
  marginLeft: 6,
  fontWeight: '500',
},

// Loading States
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
loadingText: {
  marginTop: 16,
  fontSize: 18,
  fontWeight: '600',
  color: '#ffffff',
  textAlign: 'center',
},
loadingSubtext: {
  marginTop: 4,
  fontSize: 16,
  color: 'rgba(255,255,255,0.8)',
  textAlign: 'center',
},

// White Container
whiteContainer: {
  flex: 1,
  backgroundColor: '#1a1a1a',
  marginTop: -20, // Slight overlap
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingTop: 20,
},

// Activities Section
activitiesSection: {
  paddingHorizontal: 16,
  marginBottom: 20,
},
activityCard: {
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  overflow: 'hidden',
},
activityTime: {
  backgroundColor: 'rgba(74, 222, 128, 0.2)',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginRight: 16,
},
activityTimeText: {
  fontSize: 12,
  color: '#4ade80',
  fontWeight: '600',
},
activityTitle: {
  flex: 1,
  fontSize: 14,
  color: 'rgba(255,255,255,0.9)',
  fontWeight: '500',
},
activityStatus: {
  backgroundColor: 'rgba(34, 197, 94, 0.3)',
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 4,
},
activityStatusText: {
  fontSize: 11,
  color: '#22c55e',
  fontWeight: '600',
},
notStartedStatus: {
  backgroundColor: 'rgba(156, 163, 175, 0.2)',
},
notStartedText: {
  color: '#9ca3af',
},

// Field Section
fieldSection: {
  marginHorizontal: 16,
  marginBottom: 16,
  padding: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  overflow: 'hidden',
},
fieldHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 0,
},
viewMapText: {
  color: '#4ade80',
  fontSize: 14,
  fontWeight: '600',
},
fieldCard: {
  borderRadius: 16,
  overflow: 'hidden',
  height: 180,
},
fieldImage: {
  flex: 1,
  justifyContent: 'flex-end',
},
fieldImageStyle: {
  borderRadius: 16,
},
fieldGradient: {
  padding: 16,
  justifyContent: 'flex-end',
},
fieldName: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 4,
},
fieldCoordinates: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  marginBottom: 8,
},
harvestBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#4ade80',
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 4,
  marginBottom: 12,
},
harvestText: {
  fontSize: 11,
  color: '#ffffff',
  fontWeight: '600',
},
fieldStats: {
  flexDirection: 'row',
  gap: 20,
},
fieldStatItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
fieldStatText: {
  color: 'rgba(255,255,255,0.9)',
  fontSize: 12,
  marginLeft: 6,
  fontWeight: '500',
},

// Hourly Weather Section
hourlyWeatherSection: {
  marginHorizontal: 16,
  marginBottom: 20,
  padding: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  overflow: 'hidden',
},
tempRangeContainer: {
  alignItems: 'center',
},
tempRangeTitle: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 20,
},
tempRangeBar: {
  width: '100%',
  height: 12,
  borderRadius: 6,
  marginBottom: 12,
  position: 'relative',
  overflow: 'hidden',
},
tempGradientBar: {
  flex: 1,
  borderRadius: 6,
},
tempIndicator: {
  position: 'absolute',
  top: '50%',
  left: '60%',
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: '#ffffff',
  marginTop: -8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
},
tempLabels: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 8,
},
tempLabel: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.7)',
  fontWeight: '500',
},
timeLabels: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '90%',
  marginTop: 4,
},
timeLabel: {
  fontSize: 11,
  color: 'rgba(255,255,255,0.5)',
  fontWeight: '400',
},

// Modern Stats Grid
modernStatsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 16,
  marginBottom: 20,
  gap: 12,
},
modernStatCard: {
  width: '48%',
  padding: 20,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 5,
  position: 'relative',
  overflow: 'hidden',
},
uvCard: {
  backgroundColor: '#f97316',
},
humidityCard: {
  backgroundColor: '#06b6d4',
},
windCard: {
  backgroundColor: '#8b5cf6',
},
pressureCard: {
  backgroundColor: '#10b981',
},
statHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},
modernStatLabel: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.9)',
  fontWeight: '500',
  marginLeft: 6,
},
modernStatValue: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 8,
},
windUnit: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  fontWeight: '500',
},
pressureUnit: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  fontWeight: '500',
},
uvChart: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 60,
  height: 40,
  opacity: 0.3,
},
uvWave: {
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  borderTopLeftRadius: 20,
},
humidityChart: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 60,
  height: 40,
  opacity: 0.3,
},
humidityWave: {
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  borderTopLeftRadius: 20,
},

// Forecast Section
forecastSection: {
  marginHorizontal: 16,
  marginBottom: 16,
  padding: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  overflow: 'hidden',
},

// Weather Graph Styles
weatherGraphContainer: {
  height: 200,
  marginVertical: 20,
  position: 'relative',
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  padding: 16,
},
graphGrid: {
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  bottom: 16,
  justifyContent: 'space-between',
},
gridLine: {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.1)',
  width: '100%',
},
tempGraphLine: {
  position: 'absolute',
  top: '50%',
  left: 16,
  right: 16,
  height: 3,
  borderRadius: 1.5,
  overflow: 'hidden',
},
tempLineGradient: {
  flex: 1,
},
weatherDataScroll: {
  flex: 1,
},
weatherDataPoint: {
  width: 60,
  height: '100%',
  marginRight: 16,
  position: 'relative',
  alignItems: 'center',
},
selectedDataPoint: {
  backgroundColor: 'rgba(74, 222, 128, 0.1)',
  borderRadius: 8,
},
tempPoint: {
  position: 'absolute',
  width: 8,
  height: 8,
  borderRadius: 4,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2,
},
maxTempPoint: {
  backgroundColor: '#ef4444',
  shadowColor: '#ef4444',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 4,
  elevation: 5,
},
minTempPoint: {
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  shadowColor: '#3b82f6',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 4,
  elevation: 5,
},
tempPointText: {
  fontSize: 10,
  fontWeight: 'bold',
  color: '#ffffff',
  position: 'absolute',
  top: -20,
  minWidth: 25,
  textAlign: 'center',
},
connectingLine: {
  position: 'absolute',
  width: 2,
  backgroundColor: 'rgba(74, 222, 128, 0.6)',
  left: '50%',
  marginLeft: -1,
  borderRadius: 1,
},
dayInfo: {
  position: 'absolute',
  bottom: 0,
  alignItems: 'center',
  width: '100%',
},
dayName: {
  fontSize: 12,
  fontWeight: '600',
  color: '#ffffff',
  marginBottom: 4,
},
weatherConditionText: {
  fontSize: 8,
  color: 'rgba(255,255,255,0.7)',
  textAlign: 'center',
  marginTop: 4,
},

// Weather Summary Cards
weatherSummaryCards: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 16,
},
summaryCard: {
  flex: 1,
  alignItems: 'center',
  padding: 12,
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 12,
  marginHorizontal: 4,
},
summaryLabel: {
  fontSize: 10,
  color: 'rgba(255,255,255,0.7)',
  marginTop: 4,
  fontWeight: '500',
},
summaryValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ffffff',
  marginTop: 2,
},

// Bottom Navigation
bottomNavSpace: {
  height: 100,
},
bottomNav: {
  position: 'absolute',
  bottom: 30,
  left: 20,
  right: 20,
  flexDirection: 'row',
  backgroundColor: 'rgba(0,0,0,0.8)',
  borderRadius: 25,
  paddingHorizontal: 20,
  paddingVertical: 15,
  alignItems: 'center',
  justifyContent: 'space-between',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
},
navItem: {
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 20,
},
activeNavItem: {
  backgroundColor: 'rgba(255,255,255,0.2)',
},
navIconContainer: {
  alignItems: 'center',
  justifyContent: 'center',
},

// Chart Sections
// Chart Sections
chartSection: {
  marginHorizontal: 16,
  marginBottom: 16,
  padding: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  overflow: 'hidden',
},
chartTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 16,
},
chartPlaceholder: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 40,
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  borderStyle: 'dashed',
},
chartPlaceholderText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#ffffff',
  marginTop: 12,
  textAlign: 'center',
},
chartDataText: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.7)',
  marginTop: 8,
  textAlign: 'center',
  lineHeight: 18,
},
chartLegend: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 16,
  gap: 20,
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
legendColor: {
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: 8,
},
legendText: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  fontWeight: '500',
},

// Detail Section
detailSection: {
  marginHorizontal: 16,
  marginBottom: 16,
  padding: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  overflow: 'hidden',
},
detailDate: {
  fontSize: 16,
  fontWeight: '600',
  color: '#ffffff',
  marginBottom: 20,
},
detailStats: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
},
detailStatItem: {
  width: '45%',
  alignItems: 'center',
  padding: 16,
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
},
detailStatLabel: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.7)',
  textAlign: 'center',
  marginTop: 8,
  marginBottom: 4,
  fontWeight: '500',
},
detailStatValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ffffff',
},

// Tips Section
tipsSection: {
  marginHorizontal: 16,
  marginBottom: 16,
  padding: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  overflow: 'hidden',
},
lastCard: {
  marginBottom: 100,
},
tipItem: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 16,
  padding: 12,
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
},
tipText: {
  flex: 1,
  marginLeft: 12,
  fontSize: 14,
  color: 'rgba(255,255,255,0.9)',
  lineHeight: 20,
  fontWeight: '400',
},});