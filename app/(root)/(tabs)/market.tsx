import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import * as Location from "expo-location";
import PlatformMap from "@/components/shared/PlatformMap";

const mockMarketData = [
  {
    crop: "Rice",
    currentPrice: "₹3,200/q",
    msp: "₹3,100/q",
    mandiPrice: "₹3,150/q",
    prediction: "↗ Expected to rise",
    confidence: 85,
    trend: "+5.2%",
    latitude: 30.7333,
    longitude: 76.7794
  },
  {
    crop: "Banana",
    currentPrice: "₹2,800/q",
    msp: "₹2,750/q",
    mandiPrice: "₹2,780/q",
    prediction: "→ Stable prices",
    confidence: 90,
    trend: "+1.1%",
    latitude: 29.0588,
    longitude: 76.0856
  },
  {
    crop: "Wheat",
    currentPrice: "₹2,650/q",
    msp: "₹2,640/q",
    mandiPrice: "₹2,645/q",
    prediction: "↗ Expected to rise",
    confidence: 78,
    trend: "+3.8%",
    latitude: 19.7515,
    longitude: 75.7139
  },
];

const mockListings = [
  {
    id: "1",
    farmerId: "farmer1",
    farmerName: "Rajesh Kumar",
    crop: "Rice",
    quantity: "50 kg",
    location: "Kochi, Kerala",
    expectedPrice: "₹3,250/q",
    description: "Premium Basmati Rice, freshly harvested",
    postedDate: "2 hours ago"
  },
  {
    id: "2",
    farmerId: "farmer2",
    farmerName: "Priya Sharma",
    crop: "Banana",
    quantity: "100 kg",
    location: "Trivandrum, Kerala",
    expectedPrice: "₹2,850/q",
    description: "Organic bananas, Grade A quality",
    postedDate: "5 hours ago"
  },
];

const mockRetailers = [
  {
    name: "City Fresh Market",
    location: "Kochi",
    buying: ["Rice", "Banana"],
    rating: 4.8,
    distance: "2.3 km"
  },
  {
    name: "Green Grocers",
    location: "Trivandrum",
    buying: ["Vegetables", "Fruits"],
    rating: 4.6,
    distance: "5.1 km"
  },
  {
    name: "Farm Fresh Depot",
    location: "Ernakulam",
    buying: ["Wheat", "Rice", "Vegetables"],
    rating: 4.7,
    distance: "3.8 km"
  },
];

const Market = () => {
  const { user } = useAuth();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [showMapView, setShowMapView] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [newListing, setNewListing] = useState({
    crop: "",
    quantity: "",
    expectedPrice: "",
    description: "",
    location: ""
  });
  const [quickInput, setQuickInput] = useState("");
  const [offerAmount, setOfferAmount] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [escrowTransactions, setEscrowTransactions] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [incomingOffers, setIncomingOffers] = useState<any[]>([
    {
      id: '1',
      retailerId: 'retailer_1',
      retailerName: 'City Fresh Market',
      listingId: '1',
      crop: 'Rice',
      quantity: '50 kg',
      offerAmount: 180,
      originalPrice: 200,
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      message: 'Interested in bulk purchase. Can you do ₹180/kg?'
    },
    {
      id: '2',
      retailerId: 'retailer_2',
      retailerName: 'Green Grocers',
      listingId: '2',
      crop: 'Wheat',
      quantity: '100 kg',
      offerAmount: 150,
      originalPrice: 170,
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      message: 'Regular customer, looking for good quality wheat'
    }
  ]);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [bulkCart, setBulkCart] = useState<any[]>([]);
  const [showBulkCart, setShowBulkCart] = useState(false);
  const [bulkOrderTarget, setBulkOrderTarget] = useState({ crop: '', quantity: 0 });

  const extractFromQuickInput = (input: string) => {
    const text = input.toLowerCase();
    
    // Extract quantity and unit
    const quantityMatch = text.match(/(\d+)\s*(kg|quintal|q|ton|tonnes?)/);
    const quantity = quantityMatch ? `${quantityMatch[1]} ${quantityMatch[2]}` : "";
    
    // Extract crop type
    const crops = ["rice", "wheat", "banana", "potato", "onion", "tomato", "corn", "sugarcane", "cotton"];
    const foundCrop = crops.find(crop => text.includes(crop));
    const crop = foundCrop ? foundCrop.charAt(0).toUpperCase() + foundCrop.slice(1) : "";
    
    // Extract location (basic pattern matching)
    const locationWords = ["in", "from", "at", "near"];
    let location = "";
    for (const word of locationWords) {
      const locationMatch = text.match(new RegExp(`${word}\\s+([a-zA-Z\\s]+)(?:\\s|$)`));
      if (locationMatch) {
        location = locationMatch[1].trim();
        break;
      }
    }
    
    return { crop, quantity, location };
  };

  const handleQuickInputChange = (input: string) => {
    setQuickInput(input);
    if (input.length > 10) { // Only auto-extract for meaningful input
      const extracted = extractFromQuickInput(input);
      setNewListing(prev => ({
        ...prev,
        crop: extracted.crop || prev.crop,
        quantity: extracted.quantity || prev.quantity,
        location: extracted.location || prev.location
      }));
    }
  };

  const handleCreateListing = () => {
    if (!newListing.crop || !newListing.quantity || !newListing.expectedPrice) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    
    Alert.alert("Success", "Listing created successfully!");
    setNewListing({ crop: "", quantity: "", expectedPrice: "", description: "", location: "" });
    setQuickInput("");
  };

  const handleMakeOffer = () => {
    if (!offerAmount || !selectedListing) return;
    
    const offerValue = parseFloat(offerAmount);
    if (offerValue > walletBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance in your wallet to make this offer.');
      return;
    }
    
    Alert.alert(
      'Confirm Escrow Payment',
      `This will lock ₹${offerAmount} in escrow until delivery is confirmed. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => createEscrowTransaction(offerValue)
        }
      ]
    );
  };

  const createEscrowTransaction = (amount: number) => {
    const newTransaction = {
      id: Date.now().toString(),
      fromUserId: user?.id || 'retailer_1',
      toUserId: selectedListing?.farmerId || 'farmer_1',
      amount: amount,
      status: 'LOCKED',
      listingId: selectedListing?.id,
      crop: selectedListing?.crop,
      quantity: selectedListing?.quantity,
      createdAt: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    setEscrowTransactions(prev => [...prev, newTransaction]);
    setWalletBalance(prev => prev - amount);
    
    Alert.alert(
      'Escrow Created',
      `₹${amount} has been locked in escrow. The farmer will be notified of your offer.`,
      [{ text: 'OK', onPress: () => setSelectedListing(null) }]
    );
    setOfferAmount('');
  };

  const handleConfirmDelivery = (transactionId: string) => {
    Alert.alert(
      'Confirm Delivery',
      'Have you received the goods as described?',
      [
        { text: 'No - Dispute', onPress: () => disputeTransaction(transactionId) },
        { text: 'Yes - Release Payment', onPress: () => releaseEscrow(transactionId) }
      ]
    );
  };

  const releaseEscrow = (transactionId: string) => {
    setEscrowTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status: 'RELEASED', releasedAt: new Date().toISOString() }
          : tx
      )
    );
    Alert.alert('Payment Released', 'The payment has been released to the farmer.');
  };

  const disputeTransaction = (transactionId: string) => {
    setEscrowTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status: 'DISPUTED', disputedAt: new Date().toISOString() }
          : tx
      )
    );
    Alert.alert('Dispute Raised', 'Your dispute has been recorded. An admin will review this case.');
  };

  const handleMakeOfferForListing = (listingId: string, farmerName: string) => {
    const listing = mockListings.find(l => l.id === listingId);
    if (listing) {
      setSelectedListing(listing);
    }
  };

  const handleAcceptOffer = (offerId: string) => {
    const offer = incomingOffers.find(o => o.id === offerId);
    if (!offer) return;
    
    Alert.alert(
      'Accept Offer',
      `Accept ₹${offer.offerAmount} for ${offer.quantity} of ${offer.crop}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            // Create escrow transaction
            const newTransaction = {
              id: Date.now().toString(),
              fromUserId: offer.retailerId,
              toUserId: user?.id || 'farmer_1',
              amount: offer.offerAmount,
              status: 'LOCKED',
              listingId: offer.listingId,
              crop: offer.crop,
              quantity: offer.quantity,
              createdAt: new Date().toISOString(),
              expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            
            setEscrowTransactions(prev => [...prev, newTransaction]);
            setIncomingOffers(prev => prev.map(o => 
              o.id === offerId ? { ...o, status: 'accepted' } : o
            ));
            
            Alert.alert('Offer Accepted', 'The payment has been locked in escrow. Prepare for delivery!');
          }
        }
      ]
    );
  };

  const handleCounterOffer = (offerId: string) => {
    const offer = incomingOffers.find(o => o.id === offerId);
    if (offer) {
      setSelectedOffer(offer);
    }
  };

  const submitCounterOffer = () => {
    if (!counterOfferAmount || !selectedOffer) return;
    
    const counterAmount = parseFloat(counterOfferAmount);
    
    Alert.alert(
      'Send Counter Offer',
      `Send counter offer of ₹${counterAmount} to ${selectedOffer.retailerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            setIncomingOffers(prev => prev.map(o => 
              o.id === selectedOffer.id 
                ? { ...o, status: 'counter_offered', counterAmount: counterAmount }
                : o
            ));
            
            Alert.alert('Counter Offer Sent', `Your counter offer of ₹${counterAmount} has been sent.`);
            setSelectedOffer(null);
            setCounterOfferAmount('');
          }
        }
      ]
    );
  };

  const handleRejectOffer = (offerId: string) => {
    Alert.alert(
      'Reject Offer',
      'Are you sure you want to reject this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            setIncomingOffers(prev => prev.map(o => 
              o.id === offerId ? { ...o, status: 'rejected' } : o
            ));
            Alert.alert('Offer Rejected', 'The offer has been rejected.');
          }
        }
      ]
    );
  };

  const addToBulkCart = (listing: any) => {
    const existingItem = bulkCart.find(item => item.id === listing.id);
    if (existingItem) {
      Alert.alert('Info', 'Item already in bulk cart');
      return;
    }
    setBulkCart(prev => [...prev, { ...listing, selectedQuantity: parseInt(listing.quantity) }]);
    Alert.alert('Success', 'Added to bulk cart');
  };

  const removeFromBulkCart = (listingId: string) => {
    setBulkCart(prev => prev.filter(item => item.id !== listingId));
  };

  const updateBulkQuantity = (listingId: string, quantity: number) => {
    setBulkCart(prev => prev.map(item => 
      item.id === listingId ? { ...item, selectedQuantity: quantity } : item
    ));
  };

  const calculateBulkTotal = () => {
    return bulkCart.reduce((total, item) => {
      const pricePerKg = parseInt(item.expectedPrice.replace('₹', '').replace(',', '').replace('/q', '')) / 100;
      return total + (pricePerKg * item.selectedQuantity);
    }, 0);
  };

  const processBulkOrder = () => {
    if (bulkCart.length === 0) {
      Alert.alert('Error', 'No items in bulk cart');
      return;
    }
    
    const totalAmount = calculateBulkTotal();
    if (walletBalance < totalAmount) {
      Alert.alert('Error', 'Insufficient wallet balance');
      return;
    }
    
    setWalletBalance(prev => prev - totalAmount);
    setBulkCart([]);
    setShowBulkCart(false);
    Alert.alert('Success', `Bulk order placed successfully! Total: ₹${totalAmount.toLocaleString()}`);
  };

  const filteredListings = mockListings.filter(listing => 
    listing.crop.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCrop === "" || listing.crop === selectedCrop)
  );

  const renderFarmerView = () => (
    <View>
      {/* Create New Listing */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-xl font-bold text-green-800 mb-4">Create New Listing</Text>
        
        {/* Quick Input with Auto-Fill */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">Quick Input (AI Auto-Fill)</Text>
          <TextInput
            className="border border-green-300 rounded-lg p-3 mb-2 bg-green-50"
            placeholder='Try: "50 kg rice for sale from Kochi"'
            value={quickInput}
            onChangeText={handleQuickInputChange}
            multiline
          />
          <Text className="text-xs text-gray-500">💡 Describe your listing naturally - we'll extract details automatically!</Text>
        </View>
        
        <View className="border-t border-gray-200 pt-4">
          <Text className="text-sm text-gray-600 mb-3">Extracted Details (Edit if needed)</Text>
          
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3"
            placeholder="Crop type (e.g., Rice, Wheat, Banana)"
            value={newListing.crop}
            onChangeText={(text) => setNewListing({...newListing, crop: text})}
          />
          
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3"
            placeholder="Quantity (e.g., 50 kg)"
            value={newListing.quantity}
            onChangeText={(text) => setNewListing({...newListing, quantity: text})}
          />
          
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3"
            placeholder="Location (e.g., Kochi, Kerala)"
            value={newListing.location}
            onChangeText={(text) => setNewListing({...newListing, location: text})}
          />
          
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3"
            placeholder="Expected Price (e.g., ₹3,200/q)"
            value={newListing.expectedPrice}
            onChangeText={(text) => setNewListing({...newListing, expectedPrice: text})}
          />
          
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4"
            placeholder="Additional description (optional)"
            value={newListing.description}
            onChangeText={(text) => setNewListing({...newListing, description: text})}
            multiline
            numberOfLines={2}
          />
        </View>
        
        <TouchableOpacity 
          className="bg-green-600 rounded-lg p-3"
          onPress={handleCreateListing}
        >
          <Text className="text-white text-center font-semibold">Create Listing</Text>
        </TouchableOpacity>
      </View>

      {/* Price Dashboard */}
      <Text className="text-2xl font-bold text-green-800 mb-4">Price Dashboard</Text>
      {mockMarketData.map((item, index) => (
        <View key={index} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-800">{item.crop}</Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-medium">{item.trend}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">MSP: {item.msp}</Text>
            <Text className="text-gray-600">Mandi: {item.mandiPrice}</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-green-600">{item.currentPrice}</Text>
            <Text className="text-gray-500">Confidence: {item.confidence}%</Text>
          </View>
          
          <Text className="text-gray-600 mt-2">{item.prediction}</Text>
        </View>
      ))}

      {/* Incoming Offers */}
      {incomingOffers.filter(offer => offer.status === 'pending').length > 0 && (
        <View className="mb-4">
          <Text className="text-2xl font-bold text-green-800 mb-4">Incoming Offers</Text>
          {incomingOffers.filter(offer => offer.status === 'pending').map((offer) => (
            <View key={offer.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm border-l-4 border-blue-500">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-800">{offer.retailerName}</Text>
                <Text className="text-gray-500 text-sm">
                  {new Date(offer.createdAt).toLocaleTimeString()}
                </Text>
              </View>
              
              <Text className="text-lg font-medium text-gray-700 mb-2">{offer.crop} - {offer.quantity}</Text>
              <Text className="text-gray-600 mb-3">💬 {offer.message}</Text>
              
              <View className="bg-gray-50 p-3 rounded-lg mb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Your Price:</Text>
                  <Text className="text-gray-800 font-medium">₹{offer.originalPrice}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Their Offer:</Text>
                  <Text className="text-blue-600 font-bold">₹{offer.offerAmount}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Difference:</Text>
                  <Text className={`font-medium ${
                    offer.offerAmount >= offer.originalPrice ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {offer.offerAmount >= offer.originalPrice ? '+' : ''}₹{offer.offerAmount - offer.originalPrice}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row space-x-2">
                <TouchableOpacity 
                  className="flex-1 bg-red-100 rounded-lg p-3"
                  onPress={() => handleRejectOffer(offer.id)}
                >
                  <Text className="text-red-700 text-center font-semibold">Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-yellow-100 rounded-lg p-3"
                  onPress={() => handleCounterOffer(offer.id)}
                >
                  <Text className="text-yellow-700 text-center font-semibold">Counter</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-green-600 rounded-lg p-3"
                  onPress={() => handleAcceptOffer(offer.id)}
                >
                  <Text className="text-white text-center font-semibold">Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderRetailerView = () => (
    <View>
      {/* Market Trends Section */}
      {!showMapView && (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-green-800 mb-4">📈 Market Trends & Prices</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {mockMarketData.map((item, index) => (
              <View key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mr-3 min-w-[200px] border border-green-200">
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
      )}

      {/* Search and Filter */}
      {!showMapView && (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-green-800 mb-4">🔍 Search & Filter Crops</Text>
          
          <View className="flex-row space-x-2 mb-3">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Search by crop name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity className="bg-green-600 rounded-lg px-4 py-3">
              <MaterialCommunityIcons name="magnify" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3 bg-gray-50"
            placeholder="Filter by location (e.g., Kochi, Kerala)..."
            value={locationFilter}
            onChangeText={setLocationFilter}
          />
          
          <Text className="text-sm text-gray-600 mb-2">Quick Filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
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
      )}

      {/* Available Listings */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-green-800">🛒 Available Listings</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-700 font-medium text-sm">{filteredListings.filter(listing => 
            listing.location.toLowerCase().includes(locationFilter.toLowerCase())
          ).length} items</Text>
        </View>
      </View>
      {filteredListings.filter(listing => 
        listing.location.toLowerCase().includes(locationFilter.toLowerCase())
      ).map((listing) => {
        const matchingMarketData = mockMarketData.find(item => 
          item.crop.toLowerCase() === listing.crop.toLowerCase()
        );
        const priceComparison = matchingMarketData ? 
          (parseFloat(listing.expectedPrice.replace('₹', '').replace(',', '').replace('/q', '')) < parseFloat(matchingMarketData.currentPrice.replace('₹', '').replace(',', '').replace('/q', ''))) 
          : null;
        
        return (
          <View key={listing.id} className="bg-white rounded-xl p-4 mb-4 shadow-lg border border-gray-100">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xl font-bold text-gray-800 mr-2">{listing.crop}</Text>
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
                  <Text className="text-gray-600 ml-1">by {listing.farmerName}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                  <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-1">{listing.location}</Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="clock" size={16} color="#6B7280" />
                  <Text className="text-gray-500 ml-1 text-sm">{listing.postedDate}</Text>
                </View>
              </View>
              
              <View className="items-end">
                <Text className="text-2xl font-bold text-green-600">{listing.expectedPrice}</Text>
                {matchingMarketData && (
                  <Text className="text-sm text-gray-500">Market: {matchingMarketData.currentPrice}</Text>
                )}
              </View>
            </View>
            
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="package-variant" size={18} color="#059669" />
                  <Text className="text-gray-700 font-medium ml-1">Quantity Available</Text>
                </View>
                <Text className="text-lg font-bold text-gray-800">{listing.quantity}</Text>
              </View>
              <Text className="text-gray-700 text-sm leading-5">{listing.description}</Text>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 rounded-lg py-3 px-4 shadow-sm"
                onPress={() => handleMakeOfferForListing(listing.id, listing.farmerName)}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialCommunityIcons name="handshake" size={18} color="white" />
                  <Text className="text-white text-center font-semibold ml-2">Make Offer</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg py-3 px-4 shadow-sm"
                onPress={() => addToBulkCart(listing)}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialCommunityIcons name="cart-plus" size={18} color="white" />
                  <Text className="text-white text-center font-semibold ml-2">Add to Bulk</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-green-800">
            {user?.role === 'farmer' ? 'Farmer Dashboard' : 'Retailer Marketplace'}
          </Text>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 font-medium capitalize">{user?.role || 'User'}</Text>
          </View>
        </View>

        {/* View Toggle */}
        <View className="flex-row bg-white rounded-xl p-1 mb-4 shadow-sm">
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${!showMapView ? 'bg-green-600' : 'bg-transparent'}`}
            onPress={() => setShowMapView(false)}
          >
            <MaterialCommunityIcons 
              name="format-list-bulleted" 
              size={18} 
              color={!showMapView ? "white" : "#6B7280"} 
            />
            <Text className={`ml-2 font-semibold ${!showMapView ? 'text-white' : 'text-gray-600'}`}>List View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${showMapView ? 'bg-green-600' : 'bg-transparent'}`}
            onPress={() => setShowMapView(true)}
          >
            <MaterialCommunityIcons 
              name="map" 
              size={18} 
              color={showMapView ? "white" : "#6B7280"} 
            />
            <Text className={`ml-2 font-semibold ${showMapView ? 'text-white' : 'text-gray-600'}`}>Map View</Text>
          </TouchableOpacity>
        </View>

        {/* Bulk Cart Button for Retailers */}
        {user?.role === 'retailer' && bulkCart.length > 0 && (
          <TouchableOpacity 
            className="bg-blue-600 rounded-xl p-4 mb-4 shadow-sm flex-row justify-between items-center"
            onPress={() => setShowBulkCart(true)}
          >
            <View>
              <Text className="text-white font-bold text-lg">Bulk Cart ({bulkCart.length} items)</Text>
              <Text className="text-blue-100">Total: ₹{calculateBulkTotal().toLocaleString()}</Text>
            </View>
            <MaterialCommunityIcons name="cart" size={24} color="white" />
          </TouchableOpacity>
        )}


        
        {/* Map View */}
        {showMapView ? (
          <View className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-green-800">📍 Farmer & Retailer Locations</Text>
              <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-700 font-medium text-sm">Filter</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{height: Dimensions.get('window').height * 0.5}}>
              <PlatformMap 
                mapRegion={mapRegion}
                mockMarketData={mockMarketData}
                userLocation={userLocation}
              />
            </View>
            
            <View className="p-4">
              <View className="flex-row space-x-2 mb-4">
                <TouchableOpacity className="flex-1 bg-green-100 rounded-lg p-3 items-center">
                  <MaterialCommunityIcons name="account-group" size={24} color="#059669" />
                  <Text className="text-green-700 font-medium text-sm mt-1">Farmers</Text>
                  <Text className="text-green-600 font-bold">{mockMarketData.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-blue-100 rounded-lg p-3 items-center">
                  <MaterialCommunityIcons name="store" size={24} color="#2563EB" />
                  <Text className="text-blue-700 font-medium text-sm mt-1">Retailers</Text>
                  <Text className="text-blue-600 font-bold">{mockRetailers.length}</Text>
                </TouchableOpacity>
              </View>
              
              <View>
                <Text className="text-md font-semibold text-gray-800 mb-3">🏪 Nearby Retailers:</Text>
                {mockRetailers.map((retailer, index) => (
                  <View key={index} className="flex-row justify-between items-center py-3 px-3 bg-gray-50 rounded-lg mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <MaterialCommunityIcons name="store" size={16} color="#059669" />
                        <Text className="font-semibold text-gray-800 ml-2">{retailer.name}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="map-marker" size={14} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-1">{retailer.location}</Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                        <Text className="text-gray-600 text-sm ml-1">{retailer.rating} ⭐</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <TouchableOpacity className="bg-green-600 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">Contact</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
           <View>
             {user?.role === 'farmer' ? renderFarmerView() : renderRetailerView()}
           </View>
         )}

        {/* Wallet Balance Display */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Wallet Balance</Text>
          <Text className="text-2xl font-bold text-green-600">₹{walletBalance}</Text>
        </View>

        {/* Escrow Transactions */}
        {escrowTransactions.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">My Escrow Transactions</Text>
            {escrowTransactions.map((transaction) => (
              <View key={transaction.id} className="border border-gray-200 rounded-lg p-3 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800">{transaction.crop}</Text>
                  <Text className={`font-medium ${
                    transaction.status === 'LOCKED' ? 'text-yellow-600' :
                    transaction.status === 'RELEASED' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.status}
                  </Text>
                </View>
                <Text className="text-xl font-bold text-green-600 mb-1">₹{transaction.amount}</Text>
                <Text className="text-gray-600 mb-3">{transaction.quantity}</Text>
                
                {transaction.status === 'LOCKED' && (
                  <TouchableOpacity 
                    className="bg-blue-600 rounded-lg p-2"
                    onPress={() => handleConfirmDelivery(transaction.id)}
                  >
                    <Text className="text-white text-center font-semibold">Confirm Delivery</Text>
                  </TouchableOpacity>
                )}
                
                {transaction.status === 'DISPUTED' && (
                  <Text className="text-red-600 text-center">Under admin review</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Offer Modal */}
        {selectedListing && (
          <View className="absolute inset-0 bg-black bg-opacity-50 flex-1 justify-center items-center">
            <View className="bg-white rounded-xl p-6 m-4 w-full max-w-sm">
              <Text className="text-xl font-bold text-gray-800 mb-2">Make Offer with Escrow</Text>
              <Text className="text-gray-600 mb-1">
                {selectedListing.crop} - {selectedListing.quantity}
              </Text>
              <Text className="text-gray-600 mb-4">by {selectedListing.farmerName}</Text>
              
              <View className="bg-green-50 p-3 rounded-lg mb-4">
                <Text className="text-green-700 font-medium">Wallet Balance: ₹{walletBalance}</Text>
              </View>
              
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3"
                placeholder="Enter your offer amount"
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="numeric"
              />
              
              <Text className="text-sm text-gray-500 mb-4">
                💡 This amount will be locked in escrow until delivery is confirmed
              </Text>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  className="flex-1 bg-gray-200 rounded-lg p-3"
                  onPress={() => setSelectedListing(null)}
                >
                  <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-green-600 rounded-lg p-3"
                  onPress={handleMakeOffer}
                >
                  <Text className="text-white text-center font-semibold">Lock in Escrow</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Counter Offer Modal */}
        {selectedOffer && (
          <View className="absolute inset-0 bg-black bg-opacity-50 flex-1 justify-center items-center">
            <View className="bg-white rounded-xl p-6 m-4 w-full max-w-sm">
              <Text className="text-xl font-bold text-gray-800 mb-2">Counter Offer</Text>
              <Text className="text-gray-600 mb-1">
                {selectedOffer.crop} - {selectedOffer.quantity}
              </Text>
              <Text className="text-gray-600 mb-4">to {selectedOffer.retailerName}</Text>
              
              <View className="bg-blue-50 p-3 rounded-lg mb-4">
                <Text className="text-blue-700 font-medium">Their Offer: ₹{selectedOffer.offerAmount}</Text>
                <Text className="text-blue-700 font-medium">Your Price: ₹{selectedOffer.originalPrice}</Text>
              </View>
              
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3"
                placeholder="Enter your counter offer"
                value={counterOfferAmount}
                onChangeText={setCounterOfferAmount}
                keyboardType="numeric"
              />
              
              <Text className="text-sm text-gray-500 mb-4">
                💡 Suggest a price that works for both parties
              </Text>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  className="flex-1 bg-gray-200 rounded-lg p-3"
                  onPress={() => setSelectedOffer(null)}
                >
                  <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-blue-600 rounded-lg p-3"
                  onPress={submitCounterOffer}
                >
                  <Text className="text-white text-center font-semibold">Send Counter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Bulk Cart Modal */}
        {showBulkCart && (
          <View className="absolute inset-0 bg-black bg-opacity-50 flex-1 justify-center items-center">
            <View className="bg-white rounded-xl p-6 m-4 w-full max-w-lg max-h-96">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">Bulk Order Cart</Text>
                <TouchableOpacity onPress={() => setShowBulkCart(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="gray" />
                </TouchableOpacity>
              </View>
              
              <ScrollView className="max-h-64 mb-4">
                {bulkCart.map((item) => (
                  <View key={item.id} className="border border-gray-200 rounded-lg p-3 mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-lg font-semibold text-gray-800">{item.crop}</Text>
                      <TouchableOpacity onPress={() => removeFromBulkCart(item.id)}>
                        <MaterialCommunityIcons name="delete" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                    
                    <Text className="text-gray-600 mb-2">by {item.farmerName}</Text>
                    <Text className="text-gray-600 mb-2">{item.location}</Text>
                    
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-600">Available: {item.quantity}</Text>
                      <Text className="text-green-600 font-medium">{item.expectedPrice}</Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 mr-2">Quantity:</Text>
                      <TextInput
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-center"
                        value={item.selectedQuantity.toString()}
                        onChangeText={(text) => updateBulkQuantity(item.id, parseInt(text) || 0)}
                        keyboardType="numeric"
                      />
                      <Text className="text-gray-600 ml-2">kg</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              
              <View className="bg-gray-50 p-3 rounded-lg mb-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold text-gray-800">Total Amount:</Text>
                  <Text className="text-xl font-bold text-green-600">₹{calculateBulkTotal().toLocaleString()}</Text>
                </View>
                <Text className="text-gray-600 text-sm mt-1">Wallet Balance: ₹{walletBalance}</Text>
              </View>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  className="flex-1 bg-gray-200 rounded-lg p-3"
                  onPress={() => setShowBulkCart(false)}
                >
                  <Text className="text-gray-700 text-center font-semibold">Continue Shopping</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-green-600 rounded-lg p-3"
                  onPress={processBulkOrder}
                >
                  <Text className="text-white text-center font-semibold">Place Bulk Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Market;
