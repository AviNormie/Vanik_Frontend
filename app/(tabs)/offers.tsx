import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { WalletService } from '../../services/walletService';
import { apiService } from '../../services/apiService';

interface OfferDetails {
  id: string;
  retailerId: string;
  farmerId: string;
  listingId: string;
  pricePerKg: number;
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  escrowId?: string;
  createdAt: string;
  cropType?: string;
  farmerName?: string;
  retailerName?: string;
}

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<OfferDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  useEffect(() => {
    loadOffers();
  }, [activeTab]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const userOffers = await WalletService.getUserOffers(user?.id || 'retailer1');
      
      // Filter offers based on active tab and user role
      let filteredOffers = userOffers;
      if (user?.role === 'retailer') {
        filteredOffers = activeTab === 'sent' 
          ? userOffers.filter(offer => offer.retailerId === user.id)
          : userOffers.filter(offer => offer.farmerId === user.id);
      } else if (user?.role === 'farmer') {
        filteredOffers = activeTab === 'received'
          ? userOffers.filter(offer => offer.farmerId === user.id)
          : userOffers.filter(offer => offer.retailerId === user.id);
      }
      
      setOffers(filteredOffers);
    } catch (error) {
      console.error('Error loading offers:', error);
      Alert.alert('Error', 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOffers();
    setRefreshing(false);
  };

  const handleAcceptOffer = async (offerId: string) => {
    Alert.alert(
      'Accept Offer',
      'Are you sure you want to accept this offer? This will create an escrow transaction.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => confirmAcceptOffer(offerId) }
      ]
    );
  };

  const confirmAcceptOffer = async (offerId: string) => {
    try {
      const success = await WalletService.acceptOffer(offerId);
      if (success) {
        Alert.alert('Success', 'Offer accepted successfully!');
        loadOffers();
      } else {
        Alert.alert('Error', 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      Alert.alert('Error', 'Failed to accept offer');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    Alert.alert(
      'Reject Offer',
      'Are you sure you want to reject this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => confirmRejectOffer(offerId) }
      ]
    );
  };

  const confirmRejectOffer = async (offerId: string) => {
    try {
      const success = await WalletService.rejectOffer(offerId);
      if (success) {
        Alert.alert('Success', 'Offer rejected');
        loadOffers();
      } else {
        Alert.alert('Error', 'Failed to reject offer');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      Alert.alert('Error', 'Failed to reject offer');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'ACCEPTED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'clock-outline';
      case 'ACCEPTED': return 'check-circle';
      case 'REJECTED': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderOffer = (offer: OfferDetails) => {
    const isReceived = user?.role === 'farmer' ? activeTab === 'received' : activeTab === 'received';
    const canTakeAction = offer.status === 'PENDING' && isReceived;
    const timeAgo = new Date(offer.createdAt).toLocaleDateString();

    return (
      <View key={offer.id} style={styles.offerCard}>
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">
              {offer.cropType || 'Crop Listing'}
            </Text>
            <Text className="text-sm text-gray-600">
              {isReceived ? `From: ${offer.retailerName || offer.retailerId}` : `To: ${offer.farmerName || offer.farmerId}`}
            </Text>
          </View>
          <View className="items-end">
            <View 
              className="px-3 py-1 rounded-full flex-row items-center"
              style={{ backgroundColor: `${getStatusColor(offer.status)}20` }}
            >
              <MaterialCommunityIcons 
                name={getStatusIcon(offer.status)} 
                size={16} 
                color={getStatusColor(offer.status)} 
              />
              <Text 
                className="ml-1 font-medium text-sm"
                style={{ color: getStatusColor(offer.status) }}
              >
                {offer.status}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">{timeAgo}</Text>
          </View>
        </View>

        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600">Price per kg:</Text>
            <Text className="font-medium">₹{offer.pricePerKg.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600">Quantity:</Text>
            <Text className="font-medium">{offer.quantity} kg</Text>
          </View>
          <View className="border-t border-gray-200 pt-2 mt-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">Total Amount:</Text>
              <Text className="text-lg font-bold text-green-600">₹{offer.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {offer.escrowId && (
          <View className="bg-blue-50 rounded-lg p-3 mb-3">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="shield-check" size={16} color="#3B82F6" />
              <Text className="text-blue-700 font-medium ml-2">Escrow Active</Text>
            </View>
            <Text className="text-blue-600 text-sm mt-1">Funds are secured in escrow</Text>
          </View>
        )}

        {canTakeAction && (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => handleRejectOffer(offer.id)}
              className="flex-1 bg-red-100 rounded-lg py-3"
            >
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="close" size={18} color="#EF4444" />
                <Text className="text-red-600 font-semibold ml-2">Reject</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleAcceptOffer(offer.id)}
              className="flex-1 bg-green-100 rounded-lg py-3"
            >
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="check" size={18} color="#10B981" />
                <Text className="text-green-600 font-semibold ml-2">Accept</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Offers</Text>
          </View>
          <View className="bg-white bg-opacity-20 rounded-full px-3 py-1">
            <Text className="text-white font-medium">{offers.length} offers</Text>
          </View>
        </View>
      </View>

      {/* Tab Selector */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-1 shadow-sm">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('sent')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'sent' ? 'bg-blue-600' : 'bg-transparent'
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'sent' ? 'text-white' : 'text-gray-600'
            }`}>
              {user?.role === 'retailer' ? 'Sent Offers' : 'Made Offers'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('received')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'received' ? 'bg-blue-600' : 'bg-transparent'
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'received' ? 'text-white' : 'text-gray-600'
            }`}>
              Received Offers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offers List */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialCommunityIcons name="loading" size={48} color="#059669" />
            <Text className="text-gray-600 mt-2">Loading offers...</Text>
          </View>
        ) : offers.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialCommunityIcons name="handshake-outline" size={80} color="#D1D5DB" />
            <Text className="text-xl font-bold text-gray-400 mt-4 mb-2">
              No {activeTab} offers
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              {activeTab === 'sent' 
                ? 'You haven\'t made any offers yet' 
                : 'No offers received yet'
              }
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-600 rounded-xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Browse Marketplace</Text>
            </TouchableOpacity>
          </View>
        ) : (
          offers.map(renderOffer)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});