import React from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const features = [
  {
    icon: "leaf",
    title: "Crop Advisory",
    description:
      "Get personalized advice for your crops based on local conditions",
  },
  {
    icon: "bug",
    title: "Pest Control",
    description: "Identify and treat pest problems with expert solutions",
  },
  {
    icon: "weather-partly-cloudy",
    title: "Weather Insights",
    description: "Stay informed with local weather updates and farming tips",
  },
  {
    icon: "currency-inr",
    title: "Market Prices",
    description:
      "Access real-time market prices and trends for better decisions",
  },
];

const FeaturesSection = () => {
  return (
    <View className="py-8 bg-white">
      <Text className="text-2xl font-bold text-green-800 px-4 mb-6">
        Comprehensive Support
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-2"
      >
        {features.map((feature, index) => (
          <View
            key={index}
            className="bg-green-50 rounded-xl p-4 mx-2 w-64 shadow-sm"
          >
            <MaterialCommunityIcons
              name={feature.icon as any}
              size={32}
              color="#16a34a"
            />
            <Text className="text-lg font-semibold text-green-800 mt-3 mb-2">
              {feature.title}
            </Text>
            <Text className="text-gray-600">{feature.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FeaturesSection;
