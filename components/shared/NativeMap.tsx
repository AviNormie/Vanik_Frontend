import React from 'react';
import { View, Text, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

interface MapData {
  crop: string;
  currentPrice: string;
  prediction: string;
  latitude: number;
  longitude: number;
}

interface NativeMapProps {
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

const NativeMap: React.FC<NativeMapProps> = ({ mapRegion, mockMarketData, userLocation }) => {
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={{flex: 1}}
      region={mapRegion}
      provider={PROVIDER_DEFAULT}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {mockMarketData.map((item, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: item.latitude,
            longitude: item.longitude,
          }}
          title={`${item.crop}`}
          description={`${item.currentPrice} - ${item.prediction}`}
        >
          <View className="bg-green-600 px-3 py-2 rounded-lg">
            <Text className="text-white font-semibold text-xs">{item.crop}</Text>
            <Text className="text-white text-xs">{item.currentPrice}</Text>
          </View>
        </Marker>
      ))}
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Your Location"
          pinColor="blue"
        />
      )}
    </MapView>
  );
};

export default NativeMap;