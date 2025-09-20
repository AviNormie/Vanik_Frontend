import React from 'react';
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

const PlatformMap: React.FC<PlatformMapProps> = ({ mockMarketData }) => {
  return <WebMap mockMarketData={mockMarketData} />;
};

export default PlatformMap;