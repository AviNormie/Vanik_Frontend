import React from 'react';
import { View, Text, Platform } from 'react-native';
import WebMap from './WebMap';

interface MapData {
  crop: string;
  currentPrice: string;
  prediction: string;
  latitude: number;
  longitude: number;
}

interface PlatformMapProps {
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mockMarketData: MapData[];
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

const PlatformMap: React.FC<PlatformMapProps> = ({ mapRegion, mockMarketData, userLocation }) => {
  if (Platform.OS === 'web') {
    return <WebMap mockMarketData={mockMarketData} />;
  }

  // For native platforms, dynamically import the NativeMap component
  const [NativeMapComponent, setNativeMapComponent] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadNativeMap = async () => {
      try {
        const { default: NativeMap } = await import('./NativeMap');
        setNativeMapComponent(() => NativeMap);
      } catch (error) {
        console.log('Failed to load NativeMap:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNativeMap();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">Loading map...</Text>
      </View>
    );
  }

  if (!NativeMapComponent) {
    return <WebMap mockMarketData={mockMarketData} />;
  }

  return (
    <NativeMapComponent
      mapRegion={mapRegion}
      mockMarketData={mockMarketData}
      userLocation={userLocation}
    />
  );
};

export default PlatformMap;