import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HeroSection = () => {
  return (
    <View className="px-4 pt-2 pb-6 bg-green-50">
      <View className="items-center mb-6">
        <Text className="text-3xl font-bold text-green-800 text-center mb-2">
          Smart Farming Assistant
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">
          AI-powered insights for better farming decisions
        </Text>
      </View>

      <View className="flex-row justify-center gap-4 mb-6">
        <Link href="/ask" asChild>
          <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-full flex-row items-center">
            <MaterialCommunityIcons
              name="microphone"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-semibold">Ask in Malayalam</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="space-y-4">
        <View className="bg-white rounded-xl p-4 shadow-md">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color="#16a34a"
            />
            <Text className="text-lg font-semibold text-green-800 ml-2">
              Market Intelligence
            </Text>
          </View>
          <Text className="text-gray-600">
            Predict market trends and connect directly with city retailers
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-md">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons
              name="weather-lightning"
              size={24}
              color="#16a34a"
            />
            <Text className="text-lg font-semibold text-green-800 ml-2">
              Weather Alerts
            </Text>
          </View>
          <Text className="text-gray-600">
            Get advance warnings and crop protection advice
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-md">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="leaf" size={24} color="#16a34a" />
            <Text className="text-lg font-semibold text-green-800 ml-2">
              Smart Recommendations
            </Text>
          </View>
          <Text className="text-gray-600">
            Personalized crop, disease, and fertilizer guidance
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HeroSection;
