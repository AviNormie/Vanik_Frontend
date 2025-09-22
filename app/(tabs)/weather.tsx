// app/(tabs)/weather.tsx
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { weatherService, WeatherData, ForecastData } from '../../services/weatherService';
import { useAuth } from '../../context/AuthContext';
// import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

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
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for max temp
          strokeWidth: 3,
        },
        {
          data: minTemps,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for min temp
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
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green for humidity
          strokeWidth: 3,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>मौसम की जानकारी लोड हो रही है...</Text>
        <Text style={styles.loadingSubtext}>Loading weather information...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Weather Card */}
      {currentWeather && (
        <View style={styles.currentWeatherCard}>
          <View style={styles.locationHeader}>
            <MaterialCommunityIcons name="map-marker" size={20} color="white" />
            <Text style={styles.locationText}>
              {currentWeather.location.name}, {currentWeather.location.region}
            </Text>
          </View>
          
          <View style={styles.currentWeatherContent}>
            <View style={styles.temperatureSection}>
              <MaterialCommunityIcons
                name={getWeatherIcon(currentWeather.current.condition.text)}
                size={80}
                color="white"
              />
              <Text style={styles.temperature}>
                {Math.round(currentWeather.current.temp_c)}°C
              </Text>
            </View>
            
            <View style={styles.weatherDetails}>
              <Text style={styles.condition}>
                {currentWeather.current.condition.text}
              </Text>
              <Text style={styles.feelsLike}>
                महसूस होता है {Math.round(currentWeather.current.feelslike_c)}°C
              </Text>
              <Text style={styles.feelsLikeEn}>
                Feels like {Math.round(currentWeather.current.feelslike_c)}°C
              </Text>
            </View>
          </View>
          
          <View style={styles.weatherStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="water-percent" size={20} color="white" />
              <Text style={styles.statValue}>{currentWeather.current.humidity}%</Text>
              <Text style={styles.statLabel}>नमी / Humidity</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="weather-windy" size={20} color="white" />
              <Text style={styles.statValue}>{Math.round(currentWeather.current.wind_kph)} km/h</Text>
              <Text style={styles.statLabel}>हवा / Wind</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="water" size={20} color="white" />
              <Text style={styles.statValue}>{currentWeather.current.precip_mm} mm</Text>
              <Text style={styles.statLabel}>बारिश / Rain</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="gauge" size={20} color="white" />
              <Text style={styles.statValue}>{currentWeather.current.pressure_mb} mb</Text>
              <Text style={styles.statLabel}>दबाव / Pressure</Text>
            </View>
          </View>
        </View>
      )}

      {/* 7-Day Forecast */}
      {forecast && (
        <View style={styles.forecastCard}>
          <Text style={styles.sectionTitle}>
            7 दिन का मौसम पूर्वानुमान / 7-Day Weather Forecast
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {forecast.forecast.forecastday.map((day, index) => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.forecastItem,
                  selectedDay === index && styles.selectedForecastItem,
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={styles.forecastDate}>
                  {new Date(day.date).toLocaleDateString('hi', { weekday: 'short' })}
                </Text>
                <Text style={styles.forecastDateEn}>
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </Text>
                <MaterialCommunityIcons
                  name={getWeatherIcon(day.day.condition.text)}
                  size={32}
                  color="#16a34a"
                />
                <Text style={styles.forecastTemp}>
                  {Math.round(day.day.maxtemp_c)}°
                </Text>
                <Text style={styles.forecastTempMin}>
                  {Math.round(day.day.mintemp_c)}°
                </Text>
                <Text style={styles.forecastCondition}>
                  {day.day.condition.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Temperature Chart */}
      {getTemperatureChartData() && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            तापमान का ग्राफ / Temperature Chart
          </Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#16a34a" />
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
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            नमी का ग्राफ / Humidity Chart
          </Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="water-percent" size={48} color="#16a34a" />
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
        <View style={styles.detailCard}>
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
              <MaterialCommunityIcons name="thermometer" size={24} color="#16a34a" />
              <Text style={styles.detailStatLabel}>तापमान / Temperature</Text>
              <Text style={styles.detailStatValue}>
                {Math.round(forecast.forecast.forecastday[selectedDay].day.maxtemp_c)}° / {Math.round(forecast.forecast.forecastday[selectedDay].day.mintemp_c)}°
              </Text>
            </View>
            
            <View style={styles.detailStatItem}>
              <MaterialCommunityIcons name="water-percent" size={24} color="#16a34a" />
              <Text style={styles.detailStatLabel}>नमी / Humidity</Text>
              <Text style={styles.detailStatValue}>
                {forecast.forecast.forecastday[selectedDay].day.avghumidity}%
              </Text>
            </View>
            
            <View style={styles.detailStatItem}>
              <MaterialCommunityIcons name="weather-windy" size={24} color="#16a34a" />
              <Text style={styles.detailStatLabel}>हवा / Wind</Text>
              <Text style={styles.detailStatValue}>
                {Math.round(forecast.forecast.forecastday[selectedDay].day.maxwind_kph)} km/h
              </Text>
            </View>
            
            <View style={styles.detailStatItem}>
              <MaterialCommunityIcons name="water" size={24} color="#16a34a" />
              <Text style={styles.detailStatLabel}>बारिश / Rain</Text>
              <Text style={styles.detailStatValue}>
                {forecast.forecast.forecastday[selectedDay].day.totalprecip_mm} mm
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Farming Tips */}
      <View style={styles.tipsCard}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  currentWeatherCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  currentWeatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  temperatureSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  weatherDetails: {
    flex: 1,
  },
  condition: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  feelsLikeEn: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  forecastCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  forecastItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    minWidth: 80,
  },
  selectedForecastItem: {
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  forecastDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  forecastDateEn: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  forecastTempMin: {
    fontSize: 12,
    color: '#6b7280',
  },
  forecastCondition: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    textAlign: 'center',
  },
  chartDataText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  detailDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  detailStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailStatItem: {
    width: '50%',
    alignItems: 'center',
    padding: 12,
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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