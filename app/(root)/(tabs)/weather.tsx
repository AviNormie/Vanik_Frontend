import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const mockWeatherData = {
  current: {
    temp: "28°C",
    condition: "Partly Cloudy",
    humidity: "75%",
    rainfall: "60mm",
  },
  forecast: [
    {
      day: "Tomorrow",
      condition: "Heavy Rain",
      warning: "Heavy rainfall expected. Protect your crops.",
      actions: [
        "Cover young plants",
        "Check drainage",
        "Apply preventive fungicide",
      ],
    },
    {
      day: "Next Week",
      condition: "Heat Wave",
      warning: "High temperatures forecasted.",
      actions: ["Increase irrigation", "Use shade nets", "Mulch soil"],
    },
  ],
};

const Weather = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Current Weather */}
        <View className="bg-green-700 rounded-xl p-6 mb-6">
          <Text className="text-green-100 text-lg mb-2">Current Weather</Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-4xl font-bold mb-2">
                {mockWeatherData.current.temp}
              </Text>
              <Text className="text-green-100">
                {mockWeatherData.current.condition}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={48}
              color="white"
            />
          </View>
          <View className="flex-row mt-4 gap-4">
            <View className="flex-1 bg-green-600/50 rounded-lg p-3">
              <Text className="text-green-100">Humidity</Text>
              <Text className="text-white font-semibold">
                {mockWeatherData.current.humidity}
              </Text>
            </View>
            <View className="flex-1 bg-green-600/50 rounded-lg p-3">
              <Text className="text-green-100">Rainfall</Text>
              <Text className="text-white font-semibold">
                {mockWeatherData.current.rainfall}
              </Text>
            </View>
          </View>
        </View>

        {/* Weather Alerts */}
        <Text className="text-2xl font-bold text-green-800 mb-4">
          Weather Alerts & Actions
        </Text>

        {mockWeatherData.forecast.map((forecast, index) => (
          <View key={index} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                {forecast.day}
              </Text>
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-700">{forecast.condition}</Text>
              </View>
            </View>

            <View className="bg-yellow-50 p-3 rounded-lg mb-3">
              <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons
                  name="alert"
                  size={20}
                  color="#b45309"
                />
                <Text className="text-yellow-800 font-medium ml-2">
                  Warning
                </Text>
              </View>
              <Text className="text-yellow-800">{forecast.warning}</Text>
            </View>

            <Text className="font-medium text-gray-800 mb-2">
              Recommended Actions:
            </Text>
            {forecast.actions.map((action, idx) => (
              <View key={idx} className="flex-row items-center mb-1">
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color="#16a34a"
                />
                <Text className="text-gray-600 ml-2">{action}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Weather;
