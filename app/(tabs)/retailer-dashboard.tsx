import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
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
  farmer: string;
  price: string;
  quantity: string;
  location: string;
  selected: boolean;
}

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [showMapView, setShowMapView] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bulkCart, setBulkCart] = useState<BulkCartItem[]>([]);
  const [showBulkCart, setShowBulkCart] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [listings, setListings] = useState<CropListing[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [listingsData, marketDataResponse, balance] = await Promise.all([
        apiService.getAllOpenListings(),
        apiService.getMarketData(),
        WalletService.getWalletBalance('retailer1')
      ]);
      
      setListings(listingsData);
      setMarketData(marketDataResponse);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build search parameters
      const searchParams: any = {};
      if (searchQuery.trim()) searchParams.query = searchQuery.trim();
      if (locationFilter.trim()) searchParams.location = locationFilter.trim();
      if (selectedCrop) searchParams.cropType = selectedCrop;
      
      // Call API with search parameters
      const searchResults = await apiService.searchListings(searchParams);
      setListings(searchResults);
      
      Alert.alert('Search Complete', `Found ${searchResults.length} listings`);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const balance = await WalletService.getWalletBalance('retailer1');
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  // Filter listings based on search criteria
  const filteredListings = listings.filter((listing: CropListing) => {
    const matchesSearch = listing.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.farmerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = listing.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCrop = selectedCrop === '' || listing.cropType === selectedCrop;
    
    return matchesSearch && matchesLocation && matchesCrop;
  });

  // Handle adding item to bulk cart
  const handleAddToBulk = (listing: CropListing) => {
    const existingItem = bulkCart.find(item => item.id === listing.id);
    if (existingItem) {
      Alert.alert('Already Added', 'This item is already in your bulk cart');
      return;
    }

    const newItem: BulkCartItem = {
      id: listing.id,
      cropType: listing.cropType,
      farmer: listing.farmerId,
      price: `₹${listing.expectedPrice}/q`,
      quantity: `${listing.quantityKg} kg`,
      location: listing.location,
      selected: true,
    };

    setBulkCart([...bulkCart, newItem]);
    Alert.alert('Added to Bulk Cart', `${listing.cropType} from ${listing.farmerId} added to bulk cart`);
  };

  // Handle making individual offer
  const handleMakeOffer = (listing: CropListing) => {
    setSelectedListing(listing);
    setShowOfferModal(true);
  };

  // Submit individual offer
  const submitOffer = async () => {
    if (!offerAmount || !offerQuantity || parseFloat(offerAmount) <= 0 || parseFloat(offerQuantity) <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid offer amount and quantity');
      return;
    }

    const pricePerKg = parseFloat(offerAmount);
    const quantity = parseFloat(offerQuantity);

    const totalCost = pricePerKg * quantity;

    if (totalCost > walletBalance) {
      Alert.alert('Insufficient Balance', 'Please top up your wallet to make this offer');
      return;
    }

    try {
      // Create offer using wallet service (includes escrow)
      const result = await WalletService.makeOffer(
        user?.id || 'retailer1',
        selectedListing?.farmerId || '',
        selectedListing?.id || '',
        pricePerKg,
        quantity
      );
      
      if (!result.success) {
        Alert.alert('Error', result.message);
        return;
      }
      
      // Also create offer via API
      const offerData: CreateOfferDto = {
        listingId: selectedListing?.id || '',
        pricePerKg: pricePerKg,
      };
      
      await apiService.createOffer(offerData);

      Alert.alert('Offer Submitted', `Your offer of ₹${offerAmount}/kg for ${offerQuantity}kg has been submitted and funds are in escrow.`);
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferQuantity('');
      setSelectedListing(null);
      loadWalletBalance();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit offer');
    }
  };

  // Handle bulk purchase
  const handleBulkPurchase = () => {
    const selectedItems = bulkCart.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select items for bulk purchase');
      return;
    }

    // Calculate total (mock calculation)
    const totalQuantity = selectedItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity.replace(' kg', ''));
      return sum + qty;
    }, 0);

    const averagePrice = selectedItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('₹', '').replace(',', '').replace('/q', ''));
      return sum + price;
    }, 0) / selectedItems.length;

    const totalAmount = (totalQuantity / 100) * averagePrice; // Convert kg to quintal

    if (totalAmount > walletBalance) {
      Alert.alert('Insufficient Balance', 'Please top up your wallet to complete this bulk purchase');
      return;
    }

    // Process bulk purchase
    setWalletBalance(prev => prev - totalAmount);
    setBulkCart([]);
    setShowBulkCart(false);
    Alert.alert(
      'Bulk Purchase Successful',
      `Total: ${totalQuantity} kg\nAverage Price: ₹${averagePrice.toFixed(2)}/q\nTotal Amount: ₹${totalAmount.toFixed(2)}`
    );
  };

  // Handle wallet top-up
  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount');
      return;
    }

    try {
      const success = await WalletService.topUpWallet('retailer1', parseFloat(topUpAmount));

      if (success) {
        Alert.alert('Success', `₹${topUpAmount} added to your wallet successfully!`);
        await loadWalletBalance(); // Refresh wallet balance
        setShowTopUpModal(false);
        setTopUpAmount('');
      } else {
        Alert.alert('Error', 'Failed to top up wallet. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to top up wallet. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            <Text className="text-white font-medium ml-2">Back</Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity 
              onPress={() => setShowBulkCart(true)}
              className="relative bg-white bg-opacity-20 p-3 rounded-full"
            >
              <MaterialCommunityIcons name="cart" size={24} color="white" />
              {bulkCart.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{bulkCart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowTopUpModal(true)}
              className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex-row items-center"
            >
              <MaterialCommunityIcons name="wallet" size={20} color="white" />
              <Text className="text-white font-bold ml-1">₹{walletBalance.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.headerText}>Retailer Dashboard</Text>
        <Text className="text-white text-opacity-90 text-lg">Welcome back, {user?.name || 'Retailer'}</Text>
      </View>

      {/* Market Trends Section */}
      <View style={styles.marketTrendsContainer}>
        <Text style={styles.sectionTitle}>📈 Market Trends & Prices</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {marketData.map((item, index) => (
            <View key={index} style={styles.marketCard}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold text-gray-800">{item.crop}</Text>
                <View className={`px-2 py-1 rounded-full ${
                  item.trend.includes('+') ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    item.trend.includes('+') ? 'text-green-700' : 'text-red-700'
                  }`}>{item.trend}</Text>
                </View>
              </View>
              
              <View className="space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Current:</Text>
                  <Text className="text-sm font-bold text-green-600">{item.currentPrice}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">MSP:</Text>
                  <Text className="text-sm text-gray-700">{item.msp}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Mandi:</Text>
                  <Text className="text-sm text-gray-700">{item.mandiPrice}</Text>
                </View>
              </View>
              
              <Text className="text-xs text-gray-500 mt-2">{item.prediction}</Text>
              <Text className="text-xs text-blue-600 mt-1">Confidence: {item.confidence}%</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchContainer}>
        <Text style={styles.sectionTitle}>🔍 Search & Filter Crops</Text>
        
        <View className="flex-row space-x-2 mb-3">
          <TextInput
            style={styles.searchInput}
            placeholder="Search by crop name or farmer..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <MaterialCommunityIcons name="magnify" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by location (e.g., Kochi, Kerala)..."
          value={locationFilter}
          onChangeText={setLocationFilter}
        />
        
        <Text className="text-sm text-gray-600 mb-2 mt-3">Quick Filters:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className={`mr-3 px-4 py-2 rounded-full border ${
              selectedCrop === "" ? "bg-green-600 border-green-600" : "bg-white border-gray-300"
            }`}
            onPress={() => setSelectedCrop("")}
          >
            <Text className={selectedCrop === "" ? "text-white font-medium" : "text-gray-700"}>All Crops</Text>
          </TouchableOpacity>
          {["Rice", "Banana", "Wheat", "Vegetables"].map((crop) => (
            <TouchableOpacity 
              key={crop}
              className={`mr-3 px-4 py-2 rounded-full border ${
                selectedCrop === crop ? "bg-green-600 border-green-600" : "bg-white border-gray-300"
              }`}
              onPress={() => setSelectedCrop(crop)}
            >
              <Text className={selectedCrop === crop ? "text-white font-medium" : "text-gray-700"}>{crop}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
            !showMapView ? "bg-white shadow-sm" : "bg-transparent"
          }`}
          onPress={() => setShowMapView(false)}
        >
          <MaterialCommunityIcons 
            name="format-list-bulleted" 
            size={18} 
            color={!showMapView ? "#059669" : "#6B7280"} 
          />
          <Text className={`ml-2 font-semibold ${
            !showMapView ? "text-green-600" : "text-gray-600"
          }`}>List View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
            showMapView ? "bg-white shadow-sm" : "bg-transparent"
          }`}
          onPress={() => setShowMapView(true)}
        >
          <MaterialCommunityIcons 
            name="map" 
            size={18} 
            color={showMapView ? "#059669" : "#6B7280"} 
          />
          <Text className={`ml-2 font-semibold ${
            showMapView ? "text-green-600" : "text-gray-600"
          }`}>Map View</Text>
        </TouchableOpacity>
      </View>

      {/* Listings Section */}
      <View className="mx-4 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text style={styles.sectionTitle}>🛒 Available Listings</Text>
          <View style={styles.itemCounter}>
            <Text className="text-blue-700 font-medium text-sm">{filteredListings.length} items</Text>
          </View>
        </View>

        {showMapView ? (
          // Interactive Map View
          <View className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-green-800">📍 Farmer Locations</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-medium text-sm">Filter by Crop</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 font-medium text-sm">Distance</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Map Container */}
            <View style={{height: 400}} className="bg-gray-100">
              <View className="flex-1 justify-center items-center">
                <MaterialCommunityIcons name="map-outline" size={64} color="#6b7280" />
                <Text className="text-gray-600 text-lg font-semibold mt-4">Interactive Map</Text>
                <Text className="text-gray-500 text-center mt-2 px-4">
                  Farmer locations with crop listings
                </Text>
              </View>
            </View>
            
            {/* Map Legend and Stats */}
            <View className="p-4">
              <View className="flex-row space-x-2 mb-4">
                <View className="flex-1 bg-green-100 rounded-lg p-3 items-center">
                  <MaterialCommunityIcons name="account-group" size={24} color="#059669" />
                  <Text className="text-green-700 font-medium text-sm mt-1">Active Farmers</Text>
                  <Text className="text-green-600 font-bold">{filteredListings.length}</Text>
                </View>
                <View className="flex-1 bg-blue-100 rounded-lg p-3 items-center">
                  <MaterialCommunityIcons name="package-variant" size={24} color="#2563EB" />
                  <Text className="text-blue-700 font-medium text-sm mt-1">Crop Types</Text>
                  <Text className="text-blue-600 font-bold">{new Set(filteredListings.map(l => l.cropType)).size}</Text>
                </View>
                <View className="flex-1 bg-orange-100 rounded-lg p-3 items-center">
                  <MaterialCommunityIcons name="map-marker-distance" size={24} color="#EA580C" />
                  <Text className="text-orange-700 font-medium text-sm mt-1">Avg Distance</Text>
                  <Text className="text-orange-600 font-bold">2.5 km</Text>
                </View>
              </View>
              
              {/* Nearby Farmers List */}
              <View>
                <Text className="text-md font-semibold text-gray-800 mb-3">🚜 Nearby Farmers:</Text>
                {filteredListings.slice(0, 3).map((listing) => {
                  const matchingMarketData = marketData.find(item => 
                    item.crop.toLowerCase() === listing.cropType.toLowerCase()
                  );
                  return (
                    <View key={listing.id} className="flex-row justify-between items-center py-3 px-3 bg-gray-50 rounded-lg mb-2">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <MaterialCommunityIcons name="account" size={16} color="#059669" />
                          <Text className="font-semibold text-gray-800 ml-2">{listing.farmerId}</Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                          <MaterialCommunityIcons name="sprout" size={14} color="#6B7280" />
                          <Text className="text-gray-600 text-sm ml-1">{listing.cropType} - {listing.quantityKg} kg</Text>
                        </View>
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons name="map-marker" size={14} color="#6B7280" />
                          <Text className="text-gray-600 text-sm ml-1">{listing.location}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-green-600">₹{listing.expectedPrice}/q</Text>
                        <TouchableOpacity 
                          className="bg-green-600 px-3 py-1 rounded-full mt-1"
                          onPress={() => handleMakeOffer(listing)}
                        >
                          <Text className="text-white text-xs font-medium">Make Offer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
                {filteredListings.length > 3 && (
                  <TouchableOpacity 
                      className="bg-blue-600 rounded-lg p-3 mt-2"
                      onPress={() => setShowMapView(false)}
                    >
                      <Text className="text-white text-center font-semibold">
                        View All {filteredListings.length} Farmers in List
                      </Text>
                    </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ) : (
          // List View
          filteredListings.map((listing) => {
            const matchingMarketData = marketData.find(item => 
              item.crop.toLowerCase() === listing.cropType.toLowerCase()
            );
            const priceComparison = matchingMarketData ? 
              (listing.expectedPrice < parseFloat(matchingMarketData.currentPrice.replace('₹', '').replace(',', '').replace('/q', ''))) 
              : null;
            
            const timeAgo = new Date(listing.createdAt).toLocaleDateString();
            
            return (
              <View key={listing.id} style={styles.listingCard}>
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-xl font-bold text-gray-800 mr-2">{listing.cropType}</Text>
                      {priceComparison !== null && (
                        <View className={`px-2 py-1 rounded-full ${
                          priceComparison ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            priceComparison ? 'text-green-700' : 'text-orange-700'
                          }`}>
                            {priceComparison ? '💰 Good Deal' : '💸 Above Market'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row items-center mb-1">
                      <MaterialCommunityIcons name="account" size={16} color="#6B7280" />
                      <Text className="text-gray-600 ml-1">by {listing.farmerId}</Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                      <Text className="text-gray-600 ml-1">{listing.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="clock" size={16} color="#6B7280" />
                      <Text className="text-gray-500 ml-1 text-sm">{timeAgo}</Text>
                    </View>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-green-600">₹{listing.expectedPrice}/q</Text>
                    {matchingMarketData && (
                      <Text className="text-sm text-gray-500">Market: {matchingMarketData.currentPrice}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.quantityContainer}>
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="package-variant" size={18} color="#059669" />
                      <Text className="text-gray-700 font-medium ml-1">Quantity Available</Text>
                    </View>
                    <Text className="text-lg font-bold text-gray-800">{listing.quantityKg} kg</Text>
                  </View>
                  <Text className="text-gray-700 text-sm leading-5">Fresh {listing.cropType.toLowerCase()} available for purchase</Text>
                </View>
                
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    style={styles.offerButton}
                    onPress={() => handleMakeOffer(listing)}
                  >
                    <View className="flex-row items-center justify-center">
                      <MaterialCommunityIcons name="handshake" size={18} color="white" />
                      <Text className="text-white text-center font-semibold ml-2">Make Offer</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.bulkButton}
                    onPress={() => handleAddToBulk(listing)}
                  >
                    <View className="flex-row items-center justify-center">
                      <MaterialCommunityIcons name="cart-plus" size={18} color="white" />
                      <Text className="text-white text-center font-semibold ml-2">Add to Bulk</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Bulk Cart Modal */}
      <Modal visible={showBulkCart} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">Bulk Purchase Cart</Text>
              <TouchableOpacity onPress={() => setShowBulkCart(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={bulkCart}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-gray-50 rounded-lg p-3 mb-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800">{item.cropType}</Text>
                      <Text className="text-gray-600 text-sm">by {item.farmer}</Text>
                      <Text className="text-gray-600 text-sm">{item.quantity} - {item.price}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setBulkCart(bulkCart.filter(cartItem => cartItem.id !== item.id));
                      }}
                      className="bg-red-100 p-2 rounded-full"
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            
            {bulkCart.length > 0 && (
              <TouchableOpacity
                onPress={handleBulkPurchase}
                className="bg-green-600 rounded-lg py-4 mt-4"
              >
                <Text className="text-white text-center font-semibold text-lg">Proceed with Bulk Purchase</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Offer Modal */}
      <Modal visible={showOfferModal} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-center px-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Make Offer</Text>
            <Text className="text-gray-600 mb-2">Crop: {selectedListing?.cropType}</Text>
            <Text className="text-gray-600 mb-2">Farmer: {selectedListing?.farmerId}</Text>
            <Text className="text-gray-600 mb-4">Listed Price: ₹{selectedListing?.expectedPrice}/q</Text>
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3"
              placeholder="Enter your offer amount (₹ per kg)"
              value={offerAmount}
              onChangeText={setOfferAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="Enter quantity (kg)"
              value={offerQuantity}
              onChangeText={setOfferQuantity}
              keyboardType="numeric"
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowOfferModal(false)}
                className="flex-1 bg-gray-200 rounded-lg py-3"
              >
                <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitOffer}
                className="flex-1 bg-green-600 rounded-lg py-3"
              >
                <Text className="text-white text-center font-semibold">Submit Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Top-up Modal */}
      <Modal visible={showTopUpModal} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-center px-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Top-up Wallet</Text>
            <Text className="text-gray-600 mb-4">Current Balance: ₹{walletBalance.toFixed(2)}</Text>
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="Enter top-up amount (₹)"
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              keyboardType="numeric"
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowTopUpModal(false)}
                className="flex-1 bg-gray-200 rounded-lg py-3"
              >
                <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTopUp}
                className="flex-1 bg-green-600 rounded-lg py-3"
              >
                <Text className="text-white text-center font-semibold">Top-up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#667eea',
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
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  marketTrendsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  marketCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    elevation: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    fontSize: 16,
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  itemCounter: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  quantityContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  offerButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bulkButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});