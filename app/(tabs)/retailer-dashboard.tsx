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
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { WalletService } from '../../services/walletService';
import { apiService, CropListing, CreateOfferDto } from '../../services/apiService';

const { width, height } = Dimensions.get('window');

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
  const [priceRangeMin, setPriceRangeMin] = useState('');
  const [priceRangeMax, setPriceRangeMax] = useState('');
  const [locationRadius, setLocationRadius] = useState('10');
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
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
      if (priceRangeMin) searchParams.minPrice = parseFloat(priceRangeMin);
      if (priceRangeMax) searchParams.maxPrice = parseFloat(priceRangeMax);
      if (locationRadius) searchParams.radius = parseFloat(locationRadius);
      
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

  const addToBulkCart = (listing: CropListing) => {
    const cartItem: BulkCartItem = {
      id: listing.id,
      cropType: listing.cropType,
      farmer: listing.farmerId,
      price: listing.expectedPrice.toString(),
      quantity: listing.quantityKg.toString(),
      location: listing.location || 'Unknown',
      selected: true,
    };
    
    setBulkCart(prev => {
      const exists = prev.find(item => item.id === listing.id);
      if (exists) {
        Alert.alert('Already Added', 'This listing is already in your bulk cart');
        return prev;
      }
      Alert.alert('Added to Bulk Cart', `${listing.cropType} from farmer added to bulk cart`);
      return [...prev, cartItem];
    });
  };

  const removeFromBulkCart = (listingId: string) => {
    setBulkCart(prev => prev.filter(item => item.id !== listingId));
  };

  const calculateBulkTotal = () => {
    return bulkCart.reduce((total, item) => {
      if (item.selected) {
        const pricePerKg = parseFloat(item.price) / 100; // Convert from per quintal to per kg
        return total + (pricePerKg * parseFloat(item.quantity));
      }
      return total;
    }, 0);
  };

  const calculateBulkQuantity = () => {
    return bulkCart.reduce((total, item) => {
      if (item.selected) {
        return total + parseFloat(item.quantity);
      }
      return total;
    }, 0);
  };

  const calculateBulkAvgPrice = () => {
    const totalQuantity = calculateBulkQuantity();
    const totalPrice = calculateBulkTotal();
    return totalQuantity > 0 ? totalPrice / totalQuantity : 0;
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

  const renderMapView = () => {
    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
        >
          {listings.map((listing) => {
            // Generate random coordinates near the region center for demo
            const lat = mapRegion.latitude + (Math.random() - 0.5) * 0.1;
            const lng = mapRegion.longitude + (Math.random() - 0.5) * 0.1;
            
            return (
              <Marker
                key={listing.id}
                coordinate={{ latitude: lat, longitude: lng }}
                title={listing.cropType}
                description={`${listing.quantityKg}kg - ₹${listing.expectedPrice}/quintal`}
              >
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{listing.cropType}</Text>
                    <Text style={styles.calloutText}>Quantity: {listing.quantityKg}kg</Text>
                    <Text style={styles.calloutText}>Price: ₹{listing.expectedPrice}/quintal</Text>
                    <Text style={styles.calloutText}>Farmer: {listing.farmerId}</Text>
                    {listing.location && (
                      <Text style={styles.calloutText}>📍 {listing.location}</Text>
                    )}
                    <View style={styles.calloutButtons}>
                      <TouchableOpacity
                        style={styles.calloutButton}
                        onPress={() => {
                          setSelectedListing(listing);
                          setOfferAmount(listing.expectedPrice.toString());
                          setOfferQuantity(listing.quantityKg.toString());
                          setShowOfferModal(true);
                        }}
                      >
                        <Text style={styles.calloutButtonText}>Make Offer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.calloutButton, { backgroundColor: '#2563eb' }]}
                        onPress={() => addToBulkCart(listing)}
                      >
                        <Text style={styles.calloutButtonText}>Add to Bulk</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>
    );
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
        
        <View style={styles.priceRangeContainer}>
          <TextInput
            style={[styles.searchInput, { flex: 1, marginRight: 8 }]}
            placeholder="Min Price (₹/quintal)"
            value={priceRangeMin}
            onChangeText={setPriceRangeMin}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.searchInput, { flex: 1 }]}
            placeholder="Max Price (₹/quintal)"
            value={priceRangeMax}
            onChangeText={setPriceRangeMax}
            keyboardType="numeric"
          />
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Location radius (km)"
          value={locationRadius}
          onChangeText={setLocationRadius}
          keyboardType="numeric"
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

      {/* Browse Marketplace Button */}
      <View style={styles.browseContainer}>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => {
            // Load all listings and show them
            loadInitialData();
            Alert.alert('Browse Marketplace', 'Showing all available farmer listings in your area');
          }}
        >
          <MaterialCommunityIcons name="storefront" size={24} color="white" />
          <Text style={styles.browseButtonText}>Browse Marketplace</Text>
        </TouchableOpacity>
      </View>

      {/* Bulk Cart Summary */}
      {bulkCart.length > 0 && (
        <View style={styles.bulkCartSummary}>
          <View style={styles.bulkCartHeader}>
            <Text style={styles.bulkCartTitle}>📦 Bulk Cart Summary</Text>
            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={() => setShowBulkCart(true)}
            >
              <Text style={styles.viewCartButtonText}>View Cart ({bulkCart.length})</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bulkCartText}>
            Total: {calculateBulkQuantity().toFixed(1)}kg from {bulkCart.length} farmers
          </Text>
          <Text style={styles.bulkCartText}>
            Avg Price: ₹{calculateBulkAvgPrice().toFixed(2)}/kg | Total: ₹{calculateBulkTotal().toFixed(2)}
          </Text>
        </View>
      )}

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
          renderMapView()
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
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
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
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
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
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)',
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 6,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
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
    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
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
    boxShadow: '0 1px 2px rgba(59, 130, 246, 0.2)',
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 8,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)',
  },
  bulkButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
  },
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
  },
  map: {
    height: 400,
    width: '100%',
  },
  calloutContainer: {
    padding: 10,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 12,
    marginBottom: 2,
  },
  calloutButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 5,
  },
  calloutButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
  },
  calloutButtonText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  browseContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  bulkCartSummary: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  bulkCartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulkCartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  viewCartButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bulkCartText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
});