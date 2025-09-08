import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const mockMarketData = [
  {
    crop: "Rice",
    currentPrice: "₹3,200/q",
    prediction: "↗ Expected to rise",
    confidence: 85,
  },
  {
    crop: "Banana",
    currentPrice: "₹2,800/q",
    prediction: "→ Stable prices",
    confidence: 90,
  },
];

const mockRetailers = [
  {
    name: "City Fresh Market",
    location: "Kochi",
    buying: ["Rice", "Banana"],
    rating: 4.8,
  },
  {
    name: "Green Grocers",
    location: "Trivandrum",
    buying: ["Vegetables", "Fruits"],
    rating: 4.6,
  },
];

const Market = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Market Predictions */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-green-800">
            Market Insights
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-green-600 mr-1">All Crops</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#16a34a"
            />
          </TouchableOpacity>
        </View>

        {mockMarketData.map((item, index) => (
          <View key={index} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-800">
                {item.crop}
              </Text>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-medium">
                  {item.currentPrice}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">{item.prediction}</Text>
              <Text className="text-gray-500">
                Confidence: {item.confidence}%
              </Text>
            </View>
          </View>
        ))}

        {/* Direct Retailers */}
        <Text className="text-2xl font-bold text-green-800 mt-6 mb-4">
          Direct Buyers
        </Text>

        {mockRetailers.map((retailer, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-lg font-semibold text-gray-800">
                  {retailer.name}
                </Text>
                <Text className="text-gray-600">{retailer.location}</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="star" size={16} color="#16a34a" />
                <Text className="text-green-600 ml-1">{retailer.rating}</Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {retailer.buying.map((crop, idx) => (
                <View key={idx} className="bg-green-50 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-sm">{crop}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity className="flex-row items-center justify-end mt-3">
              <Text className="text-green-600 mr-1">Contact Buyer</Text>
              <MaterialCommunityIcons name="phone" size={16} color="#16a34a" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Market;
