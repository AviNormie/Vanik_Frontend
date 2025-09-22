// services/weatherService.ts

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    uv: number;
  };
}

export interface ForecastData {
  location: WeatherData['location'];
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        avghumidity: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        wind_kph: number;
        humidity: number;
        precip_mm: number;
      }>;
    }>;
  };
}

class WeatherService {
  private apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY || 'ca654d221d70484e997113059252009';
  private baseUrl = process.env.EXPO_PUBLIC_WEATHER_API_URL || 'https://api.weatherapi.com/v1';

  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&aqi=no`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching current weather:', error);
      // Return fallback weather data
      return this.getFallbackWeather();
    }
  }

  async getWeatherForecast(location: string, days: number = 7): Promise<ForecastData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no&alerts=no`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      // Return fallback forecast data
      return this.getFallbackForecast();
    }
  }

  private getFallbackWeather(): WeatherData {
    return {
      location: {
        name: 'Delhi',
        region: 'Delhi',
        country: 'India',
        lat: 28.6139,
        lon: 77.2090,
        localtime: new Date().toISOString(),
      },
      current: {
        temp_c: 25,
        temp_f: 77,
        condition: {
          text: 'Partly cloudy',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
        },
        wind_kph: 10,
        wind_dir: 'NW',
        pressure_mb: 1013,
        precip_mm: 0,
        humidity: 65,
        cloud: 25,
        feelslike_c: 27,
        uv: 6,
      },
    };
  }

  private getFallbackForecast(): ForecastData {
    const baseDate = new Date();
    const forecastDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      return {
        date: date.toISOString().split('T')[0],
        day: {
          maxtemp_c: 28 + Math.random() * 5,
          mintemp_c: 18 + Math.random() * 5,
          avgtemp_c: 23 + Math.random() * 5,
          maxwind_kph: 15 + Math.random() * 10,
          totalprecip_mm: Math.random() * 2,
          avghumidity: 60 + Math.random() * 20,
          condition: {
            text: i % 2 === 0 ? 'Sunny' : 'Partly cloudy',
            icon: i % 2 === 0 ? '//cdn.weatherapi.com/weather/64x64/day/113.png' : '//cdn.weatherapi.com/weather/64x64/day/116.png',
          },
        },
        hour: Array.from({ length: 24 }, (_, h) => ({
          time: `${date.toISOString().split('T')[0]} ${h.toString().padStart(2, '0')}:00`,
          temp_c: 20 + Math.random() * 10,
          condition: {
            text: 'Clear',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          },
          wind_kph: 10 + Math.random() * 5,
          humidity: 60 + Math.random() * 20,
          precip_mm: 0,
        })),
      };
    });

    return {
      location: {
        name: 'Delhi',
        region: 'Delhi',
        country: 'India',
        lat: 28.6139,
        lon: 77.2090,
        localtime: new Date().toISOString(),
      },
      forecast: {
        forecastday: forecastDays,
      },
    };
  }
}

export const weatherService = new WeatherService();