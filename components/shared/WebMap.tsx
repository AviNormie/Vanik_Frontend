import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MapData {
  crop: string;
  currentPrice: string;
  prediction: string;
  latitude: number;
  longitude: number;
}

interface WebMapProps {
  mockMarketData: MapData[];
}

const WebMap: React.FC<WebMapProps> = ({ mockMarketData }) => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <MaterialCommunityIcons name="map-outline" size={64} color="#6b7280" />
      <Text className="text-gray-600 text-lg font-semibold mt-4">Map View</Text>
      <Text className="text-gray-500 text-center mt-2 px-4">
        Map functionality is available on mobile devices.
        Use the mobile app for interactive map features.
      </Text>
      <View className="mt-6 w-full px-4">
        <Text className="text-gray-700 font-semibold mb-3">Market Locations:</Text>
        {mockMarketData.map((item, index) => (
          <View key={index} className="bg-white p-3 rounded-lg mb-2 shadow-sm">
            <Text className="font-semibold text-green-600">{item.crop}</Text>
            <Text className="text-gray-600 text-sm">{item.currentPrice} - {item.prediction}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WebMap;