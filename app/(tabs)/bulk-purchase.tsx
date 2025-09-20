import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { WalletService } from '../../services/walletService';
import { apiService, CropListing, CreateOfferDto } from '../../services/apiService';

interface BulkCartItem {
  id: string;
  cropType: string;
  farmerId: string;
  expectedPrice: number;
  quantityKg: number;
  selectedQuantity: number;
  location: string;
  createdAt: string;
}

export default function BulkPurchase() {
  const { user } = useAuth();
  const [bulkCart, setBulkCart] = useState<BulkCartItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const balance = await WalletService.getWalletBalance(user?.id || 'retailer1');
      setWalletBalance(balance);
      
      // Load bulk cart from storage or props if passed
      // For now, we'll start with empty cart
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setBulkCart(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, selectedQuantity: Math.min(newQuantity, item.quantityKg) }
        : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setBulkCart(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateItemTotal = (item: BulkCartItem) => {
    // Convert price per quintal to price per kg
    const pricePerKg = item.expectedPrice / 100;
    return pricePerKg * item.selectedQuantity;
  };

  const calculateGrandTotal = () => {
    return bulkCart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateTotalQuantity = () => {
    return bulkCart.reduce((total, item) => total + item.selectedQuantity, 0);
  };

  const processBulkOrder = async () => {
    if (bulkCart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before proceeding');
      return;
    }

    const grandTotal = calculateGrandTotal();
    if (grandTotal > walletBalance) {
      Alert.alert(
        'Insufficient Balance', 
        `You need ₹${(grandTotal - walletBalance).toFixed(2)} more in your wallet to complete this purchase.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Top Up Wallet', onPress: () => router.push('/(tabs)/settings') }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Bulk Purchase',
      `Total Items: ${bulkCart.length}\nTotal Quantity: ${calculateTotalQuantity()} kg\nTotal Amount: ₹${grandTotal.toFixed(2)}\n\nProceed with purchase?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: confirmBulkOrder }
      ]
    );
  };

  const confirmBulkOrder = async () => {
    try {
      setProcessingOrder(true);
      const grandTotal = calculateGrandTotal();

      // Process each item as a separate offer
      for (const item of bulkCart) {
        const offerData: CreateOfferDto = {
          listingId: item.id,
          pricePerKg: item.expectedPrice / 100
        };

        // Create offer through API
        await apiService.createOffer(offerData);

        // Create escrow through wallet service
        const itemTotal = calculateItemTotal(item);
        await WalletService.makeOffer(
          user?.id || 'retailer1',
          item.farmerId,
          item.id,
          item.expectedPrice / 100,
          item.selectedQuantity
        );
      }

      // Update wallet balance
      setWalletBalance(prev => prev - grandTotal);
      setBulkCart([]);

      Alert.alert(
        'Order Placed Successfully!',
        `Your bulk order has been placed. Total amount of ₹${grandTotal.toFixed(2)} has been moved to escrow. Farmers will be notified of your offers.`,
        [
          { text: 'View Orders', onPress: () => router.push('/(tabs)/profile') },
          { text: 'Continue Shopping', onPress: () => router.push('/(tabs)/retailer-dashboard') }
        ]
      );
    } catch (error) {
      console.error('Error processing bulk order:', error);
      Alert.alert('Error', 'Failed to process bulk order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const renderCartItem = ({ item }: { item: BulkCartItem }) => {
    const itemTotal = calculateItemTotal(item);
    const pricePerKg = item.expectedPrice / 100;

    return (
      <View style={styles.cartItem}>
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{item.cropType}</Text>
            <Text className="text-sm text-gray-600">by {item.farmerId}</Text>
            <Text className="text-sm text-gray-600">{item.location}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeFromCart(item.id)}
            className="bg-red-100 p-2 rounded-full"
          >
            <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600">Available: {item.quantityKg} kg</Text>
            <Text className="text-green-600 font-medium">₹{pricePerKg.toFixed(2)}/kg</Text>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">Quantity:</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.selectedQuantity - 1)}
                className="bg-gray-200 rounded-full w-8 h-8 items-center justify-center"
              >
                <MaterialCommunityIcons name="minus" size={16} color="#374151" />
              </TouchableOpacity>
              
              <TextInput
                className="mx-3 border border-gray-300 rounded px-3 py-1 w-16 text-center"
                value={item.selectedQuantity.toString()}
                onChangeText={(text) => updateQuantity(item.id, parseInt(text) || 0)}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.selectedQuantity + 1)}
                className="bg-gray-200 rounded-full w-8 h-8 items-center justify-center"
              >
                <MaterialCommunityIcons name="plus" size={16} color="#374151" />
              </TouchableOpacity>
              
              <Text className="ml-2 text-gray-600">kg</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600">Item Total:</Text>
          <Text className="text-lg font-bold text-green-600">₹{itemTotal.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <MaterialCommunityIcons name="loading" size={48} color="#059669" />
        <Text className="text-gray-600 mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Bulk Purchase</Text>
          </View>
          <View className="bg-white bg-opacity-20 rounded-full px-3 py-1">
            <Text className="text-white font-medium">{bulkCart.length} items</Text>
          </View>
        </View>
      </View>

      {/* Wallet Balance */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="wallet" size={24} color="#059669" />
            <Text className="text-gray-800 font-medium ml-2">Wallet Balance</Text>
          </View>
          <Text className="text-xl font-bold text-green-600">₹{walletBalance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Cart Items */}
      {bulkCart.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons name="cart-outline" size={80} color="#D1D5DB" />
          <Text className="text-xl font-bold text-gray-400 mt-4 mb-2">Your cart is empty</Text>
          <Text className="text-gray-500 text-center mb-6">Add items from the marketplace to start your bulk purchase</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/retailer-dashboard')}
            className="bg-green-600 rounded-xl px-6 py-3"
          >
            <Text className="text-white font-semibold">Browse Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={bulkCart}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Order Summary */}
          <View className="bg-white border-t border-gray-200 p-4">
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Total Items:</Text>
                <Text className="font-medium">{bulkCart.length}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Total Quantity:</Text>
                <Text className="font-medium">{calculateTotalQuantity()} kg</Text>
              </View>
              <View className="border-t border-gray-200 pt-2 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-gray-800">Grand Total:</Text>
                  <Text className="text-xl font-bold text-green-600">₹{calculateGrandTotal().toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={processBulkOrder}
              disabled={processingOrder || bulkCart.length === 0}
              className={`rounded-xl py-4 ${processingOrder ? 'bg-gray-400' : 'bg-green-600'}`}
            >
              <View className="flex-row items-center justify-center">
                {processingOrder && (
                  <MaterialCommunityIcons name="loading" size={20} color="white" />
                )}
                <Text className="text-white font-bold text-lg ml-2">
                  {processingOrder ? 'Processing...' : 'Place Bulk Order'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#059669',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
});