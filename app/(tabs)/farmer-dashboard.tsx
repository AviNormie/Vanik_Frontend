import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { WalletService } from '../../services/walletService';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// Chart functionality will be added later when victory-native is installed

const { width } = Dimensions.get('window');

// Remove mock data - will use real API data

const mockPriceData: Record<string, {
  msp: number;
  agmarknet: number;
  avgOffers: number;
  trend: { x: number; y: number }[];
  mandiInfo: {
    name: string;
    contact: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
}> = {
  Rice: {
    msp: 3100,
    agmarknet: 3200,
    avgOffers: 3250,
    trend: [
      { x: 1, y: 3000 },
      { x: 2, y: 3100 },
      { x: 3, y: 3150 },
      { x: 4, y: 3200 },
      { x: 5, y: 3250 },
    ],
    mandiInfo: {
      name: 'Central Rice Mandi',
      contact: '+91-9876543210',
      address: 'Sector 26, Chandigarh',
      coordinates: { lat: 30.7333, lng: 76.7794 }
    }
  },
  Wheat: {
    msp: 2725,
    agmarknet: 2800,
    avgOffers: 2850,
    trend: [
      { x: 1, y: 2600 },
      { x: 2, y: 2700 },
      { x: 3, y: 2750 },
      { x: 4, y: 2800 },
      { x: 5, y: 2850 },
    ],
    mandiInfo: {
      name: 'Wheat Trading Center',
      contact: '+91-9876543211',
      address: 'Grain Market, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    }
  },
  Corn: {
    msp: 2090,
    agmarknet: 2150,
    avgOffers: 2200,
    trend: [
      { x: 1, y: 2000 },
      { x: 2, y: 2050 },
      { x: 3, y: 2100 },
      { x: 4, y: 2150 },
      { x: 5, y: 2200 },
    ],
    mandiInfo: {
      name: 'Corn Wholesale Market',
      contact: '+91-9876543212',
      address: 'Agricultural Market, Mumbai',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    }
  },
  Barley: {
    msp: 1735,
    agmarknet: 1800,
    avgOffers: 1850,
    trend: [
      { x: 1, y: 1700 },
      { x: 2, y: 1750 },
      { x: 3, y: 1780 },
      { x: 4, y: 1800 },
      { x: 5, y: 1850 },
    ],
    mandiInfo: {
      name: 'Barley Trading Hub',
      contact: '+91-9876543213',
      address: 'Mandi Road, Jaipur',
      coordinates: { lat: 26.9124, lng: 75.7873 }
    }
  },
  Sugarcane: {
    msp: 315,
    agmarknet: 320,
    avgOffers: 325,
    trend: [
      { x: 1, y: 310 },
      { x: 2, y: 315 },
      { x: 3, y: 318 },
      { x: 4, y: 320 },
      { x: 5, y: 325 },
    ],
    mandiInfo: {
      name: 'Sugar Mill Market',
      contact: '+91-9876543214',
      address: 'Industrial Area, Lucknow',
      coordinates: { lat: 26.8467, lng: 80.9462 }
    }
  },
  Cotton: {
    msp: 6080,
    agmarknet: 6200,
    avgOffers: 6300,
    trend: [
      { x: 1, y: 6000 },
      { x: 2, y: 6080 },
      { x: 3, y: 6150 },
      { x: 4, y: 6200 },
      { x: 5, y: 6300 },
    ],
    mandiInfo: {
      name: 'Cotton Exchange Center',
      contact: '+91-9876543215',
      address: 'Cotton Market, Ahmedabad',
      coordinates: { lat: 23.0225, lng: 72.5714 }
    }
  },
};

const cropTypes = ['Rice', 'Wheat', 'Corn', 'Barley', 'Sugarcane', 'Cotton'];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [walletBalance, setWalletBalance] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newListing, setNewListing] = useState({
    cropType: '',
    quantity: '',
    expectedPrice: '',
    location: '',
  });
  const [editingListing, setEditingListing] = useState<any>(null);

  useEffect(() => {
    loadWalletBalance();
    loadFarmerListings();
  }, []);

  const loadFarmerListings = async () => {
    try {
      setLoading(true);

      // Check auth status first
      const authStatus = await apiService.checkAuthStatus();
      console.log('🔐 Auth status:', authStatus);

      const farmerListings = await apiService.getFarmerListings();
      setListings(farmerListings);

      // Check if we're using local/sample data
      const hasLocalData = farmerListings.some(listing =>
        listing.id.startsWith('local_') || listing.id.startsWith('sample_')
      );

      if (hasLocalData) {
        console.log('📱 Using local/sample data - backend not available');
      }
    } catch (error) {
      console.error('Error loading farmer listings:', error);

      // Handle authentication errors specifically
      if ((error as Error).message?.includes('Authentication failed')) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to access your listings.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }

      // Try to load from API service (which has local fallback)
      try {
        const fallbackListings = await apiService.getFarmerListings();
        setListings(fallbackListings);
      } catch (fallbackError) {
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const balance = await WalletService.getWalletBalance(user?.id || 'farmer1');
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const addListing = async () => {
    if (!newListing.cropType || !newListing.quantity || !newListing.expectedPrice || !newListing.location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const isEditing = editingListing !== null;

    try {
      if (isEditing) {
        // Update existing listing
        const updatedListing = await apiService.updateListing(editingListing.id, {
          cropType: newListing.cropType,
          quantityKg: parseInt(newListing.quantity),
          expectedPrice: parseFloat(newListing.expectedPrice),
          location: newListing.location,
        });

        // Update local state
        setListings(prev => prev.map(listing =>
          listing.id === editingListing.id ? updatedListing : listing
        ));

        Alert.alert('Success', 'Listing updated successfully!');
      } else {
        // Create new listing
        const listing = await apiService.createListing({
          cropType: newListing.cropType,
          quantityKg: parseInt(newListing.quantity),
          expectedPrice: parseFloat(newListing.expectedPrice),
          location: newListing.location,
        });

        // Add to local state immediately for better UX
        setListings(prev => [listing, ...prev]);

        // Check if it was saved locally or to database
        const isLocalSave = listing.id.startsWith('local_');
        const successMessage = isLocalSave
          ? 'Listing saved locally! It will sync when the server is available.'
          : 'Listing added successfully and saved to database!';

        Alert.alert('Success', successMessage);
      }

      setShowAddModal(false);
      setNewListing({ cropType: '', quantity: '', expectedPrice: '', location: '' });
      setEditingListing(null);
    } catch (error) {
      console.error('Error saving listing:', error);

      // Show specific error messages
      let errorMessage = 'Failed to Save Listing';
      let errorDetails = '';

      if ((error as Error).message?.includes('timeout')) {
        errorMessage = 'Connection Timeout';
        errorDetails = 'The server is taking too long to respond. Please check your internet connection and try again.';
      } else if ((error as Error).message?.includes('Network request failed')) {
        errorMessage = 'Network Error';
        errorDetails = 'Cannot connect to the server. Please check your internet connection and ensure the backend server is running.';
      } else {
        errorDetails = 'Please check your internet connection and ensure the backend server is running.';
      }

      Alert.alert(
        errorMessage,
        errorDetails,
        [
          { text: 'Retry', onPress: addListing },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const deleteListing = async (listingId: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteListing(listingId);
              // Remove from local state immediately
              setListings(prev => prev.filter(listing => listing.id !== listingId));
              Alert.alert('Success', 'Listing deleted successfully!');
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', 'Failed to delete listing. Please try again.');
            }
          }
        }
      ]
    );
  };

  const editListing = (listing: any) => {
    // Store the listing being edited
    setEditingListing(listing);
    setNewListing({
      cropType: listing.cropType,
      quantity: listing.quantityKg.toString(),
      expectedPrice: listing.expectedPrice.toString(),
      location: listing.location,
    });
    setShowAddModal(true);
  };

  const contactMandi = (phoneNumber: string) => {
    Alert.alert(
      'Contact Mandi',
      `Would you like to call ${phoneNumber}?\n\nThis will open your phone's dialer.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            // In a real app, you would use Linking.openURL(`tel:${phoneNumber}`)
            Alert.alert(
              'Calling Mandi',
              `Opening dialer for ${phoneNumber}...\n\nContact Information:\n• Ask about current rates\n• Inquire about quality requirements\n• Check transportation facilities\n• Discuss payment terms`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const getDirections = (coordinates: { lat: number; lng: number }) => {
    Alert.alert(
      'Open in Google Maps',
      `Navigate to mandi location?\n\n📍 ${coordinates.lat}, ${coordinates.lng}\n\nThis will open Google Maps with turn-by-turn directions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Google Maps',
          onPress: () => {
            // Simulate opening Google Maps
            Alert.alert(
              'Google Maps Opening...',
              `🗺️ Opening Google Maps with directions to:\n\n📍 Latitude: ${coordinates.lat}\n📍 Longitude: ${coordinates.lng}\n\n✅ Features Available:\n• Turn-by-turn navigation\n• Real-time traffic updates\n• Estimated travel time: 25 mins\n• Alternative routes\n• Nearby fuel stations\n• Parking information`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const showNearbyMandis = () => {
    const nearbyMandis = [
      {
        name: 'Central Rice Mandi',
        distance: '2.3km',
        rate: mockPriceData[selectedCrop].agmarknet,
        contact: '+91-9876543210',
        address: 'Sector 26, Chandigarh',
        coordinates: { lat: 30.7333, lng: 76.7794 }
      },
      {
        name: 'Grain Market Hub',
        distance: '4.1km',
        rate: mockPriceData[selectedCrop].agmarknet - 50,
        contact: '+91-9876543211',
        address: 'Grain Market, Delhi',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      {
        name: 'Agricultural Center',
        distance: '6.8km',
        rate: mockPriceData[selectedCrop].agmarknet + 30,
        contact: '+91-9876543212',
        address: 'Agricultural Market, Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      {
        name: 'Wholesale Market',
        distance: '8.2km',
        rate: mockPriceData[selectedCrop].agmarknet - 20,
        contact: '+91-9876543213',
        address: 'Mandi Road, Jaipur',
        coordinates: { lat: 26.9124, lng: 75.7873 }
      },
      {
        name: 'Farmers Market',
        distance: '9.5km',
        rate: mockPriceData[selectedCrop].agmarknet + 10,
        contact: '+91-9876543214',
        address: 'Industrial Area, Lucknow',
        coordinates: { lat: 26.8467, lng: 80.9462 }
      }
    ];

    const mandiList = nearbyMandis.map((mandi, index) => 
      `${index + 1}. ${mandi.name} - ${mandi.distance}\n   Rate: ₹${mandi.rate}/kg\n   📞 ${mandi.contact}`
    ).join('\n\n');

    Alert.alert(
      '📍 Nearby Mandis for ' + selectedCrop,
      `Found ${nearbyMandis.length} mandis within 10km:\n\n${mandiList}`,
      [
        { 
          text: 'Open in Google Maps', 
          onPress: () => {
            Alert.alert(
              'Select Mandi',
              'Choose a mandi to get directions:',
              nearbyMandis.map((mandi, index) => ({
                text: `${mandi.name} (${mandi.distance})`,
                onPress: () => getDirections(mandi.coordinates)
              })).concat([{ text: 'Cancel', onPress: () => {} }])
            );
          }
        },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleAcceptOffer = async (offerId: string, escrowId: string) => {
    try {
      const success = await WalletService.acceptOffer(offerId);

      if (success) {
        Alert.alert(
          'Offer Accepted',
          'Offer has been accepted. Please proceed with delivery. Once confirmed, the payment will be released to your wallet.',
          [
            {
              text: 'Confirm Delivery',
              onPress: () => handleConfirmDelivery(escrowId),
            },
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to accept offer. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept offer. Please try again.');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const success = await WalletService.rejectOffer(offerId);

      if (success) {
        Alert.alert('Success', 'Offer has been rejected. The amount has been returned to the retailer.');
      } else {
        Alert.alert('Error', 'Failed to reject offer. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reject offer. Please try again.');
    }
  };

  const handleConfirmDelivery = async (escrowId: string) => {
    try {
      const success = await WalletService.releaseEscrow(escrowId);

      if (success) {
        Alert.alert('Success', 'Delivery confirmed! Payment has been released to your wallet.');
        await loadWalletBalance(); // Refresh wallet balance
      } else {
        Alert.alert('Error', 'Failed to confirm delivery. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm delivery. Please try again.');
    }
  };

  const handleDispute = async (escrowId: string) => {
    try {
      const success = await WalletService.disputeEscrow(escrowId);

      if (success) {
        Alert.alert('Dispute Raised', 'Your dispute has been submitted. An admin will review and resolve it.');
      } else {
        Alert.alert('Error', 'Failed to raise dispute. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to raise dispute. Please try again.');
    }
  };

  const renderAddListingModal = () => (
    <Modal visible={showAddModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingListing ? 'Edit Listing' : 'Add New Listing'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingListing(null);
                  setNewListing({ cropType: '', quantity: '', expectedPrice: '', location: '' });
                }}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop Type</Text>
                <View style={styles.cropSelectorModal}>
                  {cropTypes.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      style={[
                        styles.cropOptionModal,
                        newListing.cropType === crop && styles.cropOptionModalSelected,
                      ]}
                      onPress={() => setNewListing({ ...newListing, cropType: crop })}
                    >
                      <Text
                        style={[
                          styles.cropOptionTextModal,
                          newListing.cropType === crop && styles.cropOptionTextModalSelected,
                        ]}
                      >
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={newListing.quantity}
                  onChangeText={(text) => setNewListing({ ...newListing, quantity: text })}
                  placeholder="Enter quantity"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expected Price (₹/kg)</Text>
                <TextInput
                  style={styles.input}
                  value={newListing.expectedPrice}
                  onChangeText={(text) => setNewListing({ ...newListing, expectedPrice: text })}
                  placeholder="Enter expected price"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={newListing.location}
                  onChangeText={(text) => setNewListing({ ...newListing, location: text })}
                  placeholder="Enter location"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={addListing}>
              <Text style={styles.addButtonText}>
                {editingListing ? 'Update Listing' : 'Add Listing'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderMyListings = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addListingButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={styles.addListingButtonText}>Add Listing</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.emptyListings}>
          <View style={styles.emptyListingsIcon}>
            <MaterialCommunityIcons name="leaf-off" size={48} color="rgba(255,255,255,0.4)" />
          </View>
          <Text style={styles.emptyListingsTitle}>No listings yet</Text>
          <Text style={styles.emptyListingsText}>
            Create your first listing to start selling your crops
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadFarmerListings}
          >
            <MaterialCommunityIcons name="refresh" size={18} color="white" />
            <Text style={styles.retryButtonText}>Refresh Listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        listings.map((listing: any) => (
          <View key={listing.id} style={styles.listingCard}>
            <View style={styles.listingHeader}>
              <View style={styles.listingCropContainer}>
                <MaterialCommunityIcons 
                  name="grain" 
                  size={20} 
                  color="#4CAF50" 
                  style={styles.cropIcon}
                />
                <Text style={styles.listingCrop}>{listing.cropType}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                listing.status === 'OPEN' && styles.statusOpen,
                listing.status === 'MATCHED' && styles.statusMatched,
                listing.status === 'SOLD' && styles.statusSold,
              ]}>
                <Text style={styles.statusText}>{listing.status}</Text>
              </View>
            </View>

            <View style={styles.listingDetails}>
              <View style={styles.listingDetailRow}>
                <MaterialCommunityIcons name="scale" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.listingInfo}>Quantity: {listing.quantityKg} kg</Text>
              </View>
              <View style={styles.listingDetailRow}>
                <MaterialCommunityIcons name="currency-inr" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.listingInfo}>Expected: ₹{listing.expectedPrice}/kg</Text>
              </View>
              <View style={styles.listingDetailRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.listingInfo}>Location: {listing.location}</Text>
              </View>
              <View style={styles.listingDetailRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.listingInfo}>Posted: {new Date(listing.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.listingActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editListing(listing)}
              >
                <Ionicons name="pencil" size={14} color="white" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteListing(listing.id)}
              >
                <Ionicons name="trash" size={14} color="white" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Offer Status Section */}
            {listing.status === 'OPEN' && (
              <View style={styles.statusSection}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#FFC107" />
                <Text style={styles.statusSectionText}>Waiting for offers from nearby retailers</Text>
              </View>
            )}

            {listing.status === 'MATCHED' && (
              <View style={styles.statusSection}>
                <MaterialCommunityIcons name="handshake" size={16} color="#4CAF50" />
                <Text style={styles.statusSectionText}>Matched with retailer - Delivery in progress</Text>
              </View>
            )}

            {listing.offers && listing.offers.length > 0 && (
              <View style={styles.offersSection}>
                <Text style={styles.offersTitle}>
                  Offers Received ({listing.offers.length})
                  {listing.offers.some((o: any) => o.status === 'pending') && (
                    <Text style={styles.newOfferBadge}> • New!</Text>
                  )}
                </Text>
                {listing.offers.map((offer: any) => (
                  <View key={offer.id} style={styles.offerCard}>
                    <View style={styles.offerInfo}>
                      <Text style={styles.offerRetailer}>
                        Retailer #{offer.retailerId?.slice(-4) || 'Unknown'}
                      </Text>
                      <Text style={styles.offerPrice}>
                        ₹{offer.pricePerKg || offer.price}/kg
                      </Text>
                      <Text style={styles.offerDetails}>
                        Total: ₹{((offer.pricePerKg || offer.price) * listing.quantityKg).toLocaleString()}
                      </Text>
                      <Text style={styles.offerDate}>
                        Received: {new Date(offer.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {(offer.status === 'pending' || !offer.status) && (
                      <View style={styles.offerActions}>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleAcceptOffer(offer.id, 'escrow_' + offer.id)}
                        >
                          <MaterialCommunityIcons name="check" size={12} color="white" />
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleRejectOffer(offer.id)}
                        >
                          <MaterialCommunityIcons name="close" size={12} color="white" />
                          <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {offer.status === 'accepted' && (
                      <View style={styles.offerActions}>
                        <TouchableOpacity
                          style={styles.deliveryButton}
                          onPress={() => handleConfirmDelivery('escrow_' + offer.id)}
                        >
                          <MaterialCommunityIcons name="truck-delivery" size={12} color="white" />
                          <Text style={styles.deliveryButtonText}>Confirm Delivery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.disputeButton}
                          onPress={() => handleDispute('escrow_' + offer.id)}
                        >
                          <MaterialCommunityIcons name="alert" size={12} color="white" />
                          <Text style={styles.disputeButtonText}>Dispute</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {offer.status === 'rejected' && (
                      <View style={styles.rejectedOffer}>
                        <Text style={styles.rejectedText}>Offer Rejected</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderPriceDashboard = () => {
    // Get price data - use API if available, fallback to static data
    const getPriceData = (crop: string) => {
      // Try to get real API data first, fallback to static data
      return mockPriceData[crop] || {
        msp: 0,
        agmarknet: 0,
        avgOffers: 0,
        trend: [],
        mandiInfo: {
          name: 'Local Mandi',
          contact: '+91-1234567890',
          address: 'Market Area',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        }
      };
    };

    const currentCropData = getPriceData(selectedCrop);

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.priceHeader}>
          <Text style={styles.sectionTitle}>Live Price Dashboard</Text>
          <View style={styles.dataSourceBadge}>
            <MaterialCommunityIcons name="database" size={14} color="#4CAF50" />
            <Text style={styles.dataSourceText}>Static Data</Text>
          </View>
        </View>

        <View style={styles.cropSelector}>
          {Object.keys(mockPriceData).map((crop) => (
            <TouchableOpacity
              key={crop}
              style={[
                styles.cropOption,
                selectedCrop === crop && styles.cropOptionSelected,
              ]}
              onPress={() => setSelectedCrop(crop)}
            >
              <Text
                style={[
                  styles.cropOptionText,
                  selectedCrop === crop && styles.cropOptionTextSelected,
                ]}
              >
                {crop}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.priceCards}>
          <View style={styles.priceCard}>
            <View style={styles.priceCardHeader}>
              <MaterialCommunityIcons name="gavel" size={18} color="#4CAF50" />
              <Text style={styles.priceCardTitle}>MSP</Text>
            </View>
            <Text style={styles.priceCardValue}>₹{currentCropData.msp}</Text>
            <Text style={styles.priceCardSubtitle}>Government MSP</Text>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceCardHeader}>
              <MaterialCommunityIcons name="chart-line" size={18} color="#2196F3" />
              <Text style={styles.priceCardTitle}>Agmarknet</Text>
            </View>
            <Text style={styles.priceCardValue}>₹{currentCropData.agmarknet}</Text>
            <Text style={styles.priceCardSubtitle}>Market Rate</Text>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceCardHeader}>
              <MaterialCommunityIcons name="trending-up" size={18} color="#FF9800" />
              <Text style={styles.priceCardTitle}>Avg Offers</Text>
            </View>
            <Text style={styles.priceCardValue}>₹{currentCropData.avgOffers}</Text>
            <Text style={styles.priceCardSubtitle}>Platform Average</Text>
          </View>
        </View>

        <View style={styles.weatherWidget}>
          <View style={styles.weatherHeader}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={24} color="#4CAF50" />
            <Text style={styles.weatherTitle}>Weather</Text>
            <View style={styles.weatherStatus}>
              <MaterialCommunityIcons name="weather-cloudy" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.weatherStatusText}>Cloudy</Text>
            </View>
          </View>
          <Text style={styles.temperature}>30°c</Text>
          <View style={styles.temperatureRange}>
            <Text style={styles.tempRangeText}>6°</Text>
            <Text style={styles.tempRangeText}>27°</Text>
            <Text style={styles.tempRangeText}>28°</Text>
            <Text style={styles.tempRangeText}>29°</Text>
            <Text style={styles.tempRangeText}>31°</Text>
            <Text style={styles.tempRangeText}>32°</Text>
            <Text style={styles.tempRangeText}>33°</Text>
            <Text style={styles.tempRangeText}>34°</Text>
          </View>
          <View style={styles.temperatureBar}>
            <View style={[styles.tempBar, { backgroundColor: '#4CAF50', flex: 2 }]} />
            <View style={[styles.tempBar, { backgroundColor: '#FFC107', flex: 3 }]} />
            <View style={[styles.tempBar, { backgroundColor: '#FF5722', flex: 3 }]} />
          </View>
          <View style={styles.timeLabels}>
            <Text style={styles.timeLabel}>6 AM</Text>
            <Text style={styles.timeLabel}>10 AM</Text>
            <Text style={styles.timeLabel}>11 AM</Text>
            <Text style={styles.timeLabel}>12 PM</Text>
            <Text style={styles.timeLabel}>1PM</Text>
            <Text style={styles.timeLabel}>2PM</Text>
            <Text style={styles.timeLabel}>3PM</Text>
          </View>
          <View style={styles.windInfo}>
            <MaterialCommunityIcons name="weather-windy" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.windText}>Wind</Text>
            <Text style={styles.windValue}>68%</Text>
          </View>
        </View>

        <View style={styles.waterWidget}>
          <View style={styles.waterHeader}>
            <MaterialCommunityIcons name="water" size={20} color="#2196F3" />
            <Text style={styles.waterTitle}>Water</Text>
            <View style={styles.waterStatus}>
              <Text style={styles.waterStatusText}>Dangerous level</Text>
            </View>
          </View>
          <Text style={styles.waterPercentage}>28.7%</Text>
          <View style={styles.waterChart}>
            <View style={styles.waterChartBar} />
            <View style={styles.waterChartIndicator} />
          </View>
          <View style={styles.waterActions}>
            <TouchableOpacity style={styles.wateringButton}>
              <MaterialCommunityIcons name="plus" size={16} color="white" />
              <Text style={styles.wateringButtonText}>Watering</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.znooseButton}>
              <MaterialCommunityIcons name="plus" size={16} color="white" />
              <Text style={styles.znooseButtonText}>Znoose</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Price Trend - {selectedCrop}</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartVisual}>
              <MaterialCommunityIcons name="chart-line" size={32} color="#4CAF50" />
              <View style={styles.trendLine}>
                {currentCropData.trend.map((point, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.trendPoint, 
                      { 
                        left: `${(index / (currentCropData.trend.length - 1)) * 80}%`,
                        bottom: `${((point.y - Math.min(...currentCropData.trend.map(p => p.y))) / 
                          (Math.max(...currentCropData.trend.map(p => p.y)) - Math.min(...currentCropData.trend.map(p => p.y)))) * 40}%`
                      }
                    ]} 
                  />
                ))}
              </View>
            </View>
            <Text style={styles.chartPlaceholderText}>Interactive price chart coming soon</Text>
            <Text style={styles.trendData}>
              Recent Trend: {currentCropData.trend.map(point => `₹${point.y}`).join(' → ')}
            </Text>
            <View style={styles.trendIndicator}>
              <MaterialCommunityIcons name="trending-up" size={14} color="#4CAF50" />
              <Text style={styles.trendIndicatorText}>+2.5% this week</Text>
            </View>
          </View>
        </View>

        <View style={styles.cropDistributionWidget}>
          <View style={styles.cropDistributionHeader}>
            <MaterialCommunityIcons name="chart-donut" size={24} color="#4CAF50" />
            <Text style={styles.cropDistributionTitle}>Crop Distribution</Text>
          </View>
          <View style={styles.cropDistributionChart}>
            <View style={styles.donutChart}>
              <Text style={styles.donutCenterValue}>44.5</Text>
              <Text style={styles.donutCenterLabel}>Hectares</Text>
            </View>
            <View style={styles.cropLegend}>
              <View style={styles.cropLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Apples</Text>
                <Text style={styles.legendValue}>39.4%</Text>
                <Text style={styles.legendHectares}>14.41Ha</Text>
              </View>
              <View style={styles.cropLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>Cherries</Text>
                <Text style={styles.legendValue}>36.2%</Text>
                <Text style={styles.legendHectares}>12.61Ha</Text>
              </View>
              <View style={styles.cropLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.legendText}>Orange</Text>
                <Text style={styles.legendValue}>28.3%</Text>
                <Text style={styles.legendHectares}>17.5 Ha</Text>
              </View>
            </View>
          </View>
          <View style={styles.cropImages}>
            <View style={styles.cropImageContainer}>
              <View style={styles.cropImagePlaceholder}>
                <MaterialCommunityIcons name="apple" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.cropImageLabel}>Apple</Text>
            </View>
            <View style={styles.cropImageContainer}>
              <View style={styles.cropImagePlaceholder}>
                <MaterialCommunityIcons name="fruit-cherries" size={24} color="#FF9800" />
              </View>
              <Text style={styles.cropImageLabel}>Orange</Text>
            </View>
          </View>
        </View>

        <View style={styles.mandiContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Mandis</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={showNearbyMandis}
            >
              <MaterialCommunityIcons name="map-search" size={16} color="#4CAF50" />
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.mapContainer}
            onPress={() => getDirections(currentCropData.mandiInfo.coordinates)}
          >
            <View style={styles.mapPlaceholder}>
              <View style={styles.mapIcon}>
                <MaterialCommunityIcons name="google-maps" size={32} color="#4285f4" />
              </View>
              <Text style={styles.mapPlaceholderTitle}>Open in Google Maps</Text>
              <Text style={styles.mapPlaceholderText}>
                View {selectedCrop} mandis near you with live prices
              </Text>
              <View style={styles.mapCoordinates}>
                <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#4CAF50" />
                <Text style={styles.coordinatesText}>
                  {currentCropData.mandiInfo.coordinates.lat}°N, {currentCropData.mandiInfo.coordinates.lng}°E
                </Text>
              </View>
              <View style={styles.mapStats}>
                <View style={styles.mapStat}>
                  <MaterialCommunityIcons name="store-marker" size={14} color="#4CAF50" />
                  <Text style={styles.mapStatValue}>5 Mandis</Text>
                  <Text style={styles.mapStatLabel}>Within 10km</Text>
                </View>
                <View style={styles.mapStat}>
                  <MaterialCommunityIcons name="map-marker-distance" size={14} color="#2196F3" />
                  <Text style={styles.mapStatValue}>2.3km</Text>
                  <Text style={styles.mapStatLabel}>Closest</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.mandiCard}>
            <View style={styles.mandiHeader}>
              <View style={styles.mandiHeaderLeft}>
                <MaterialCommunityIcons name="store" size={20} color="#4CAF50" />
                <View style={styles.mandiHeaderInfo}>
                  <Text style={styles.mandiName}>{currentCropData.mandiInfo.name}</Text>
                  <View style={styles.mandiStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.mandiStatusText}>Open Now</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.mandiDetails}>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.mandiDetailText}>{currentCropData.mandiInfo.address}</Text>
              </View>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="phone" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.mandiDetailText}>{currentCropData.mandiInfo.contact}</Text>
              </View>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="clock" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.mandiDetailText}>Open: 6:00 AM - 6:00 PM</Text>
              </View>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="currency-inr" size={14} color="#4CAF50" />
                <Text style={styles.mandiDetailTextHighlight}>
                  Live Rate: ₹{currentCropData.agmarknet}/kg
                </Text>
              </View>
            </View>

            <View style={styles.mandiActions}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => contactMandi(currentCropData.mandiInfo.contact)}
              >
                <MaterialCommunityIcons name="phone" size={16} color="white" />
                <Text style={styles.contactButtonText}>Contact Mandi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => getDirections(currentCropData.mandiInfo.coordinates)}
              >
                <MaterialCommunityIcons name="directions" size={16} color="white" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    
    <View style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80' }}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Farmer Dashboard</Text>
            <View style={styles.walletInfo}>
              <MaterialCommunityIcons name="wallet" size={18} color="#4CAF50" />
              <Text style={styles.walletBalance}>₹{walletBalance}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'listings' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('listings')}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={18}
            color={activeTab === 'listings' ? '#4CAF50' : 'rgba(255,255,255,0.6)'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'listings' && styles.tabButtonTextActive,
            ]}
          >
            My Listings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'prices' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('prices')}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={18}
            color={activeTab === 'prices' ? '#4CAF50' : 'rgba(255,255,255,0.6)'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'prices' && styles.tabButtonTextActive,
            ]}
          >
            Price Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'listings' ? renderMyListings() : renderPriceDashboard()}
      </View>

      {renderAddListingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    // #1a1a1a
  },
  headerBackground: {
    height: 280,
  },
  headerBackgroundImage: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletBalance: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  tabButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  addListingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  addListingButtonText: {
    marginLeft: 4,
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 13,
  },
  listingCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingCropContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropIcon: {
    marginRight: 8,
  },
  listingCrop: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusOpen: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  statusMatched: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  statusSold: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  listingDetails: {
    marginBottom: 12,
  },
  listingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listingInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  statusSectionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  offersSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginTop: 12,
  },
  offersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  newOfferBadge: {
    color: '#FF5722',
    fontSize: 12,
    fontWeight: '700',
  },
  offerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  offerInfo: {
    marginBottom: 8,
  },
  offerRetailer: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  offerPrice: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '700',
    marginBottom: 2,
  },
  offerDetails: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  offerDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  rejectedOffer: {
    alignItems: 'center',
    padding: 6,
  },
  rejectedText: {
    color: '#F44336',
    fontSize: 11,
    fontWeight: '600',
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  deliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  deliveryButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  disputeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  disputeButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  cropSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  cropOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cropOptionSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  cropOptionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  cropOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  dataSourceText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  priceCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  priceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceCardTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
    fontWeight: '500',
  },
  priceCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  priceCardSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },
  weatherWidget: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  weatherStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  weatherStatusText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  temperature: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  temperatureRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tempRangeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  temperatureBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  tempBar: {
    height: '100%',
    marginRight: 1,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },
  windInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  windText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  windValue: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  waterWidget: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  waterStatus: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  waterStatusText: {
    fontSize: 11,
    color: '#F44336',
    fontWeight: '500',
  },
  waterPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 12,
  },
  waterChart: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
    position: 'relative',
  },
  waterChartBar: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    width: '30%',
    height: '60%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  waterChartIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#F44336',
    borderRadius: 4,
  },
  waterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  wateringButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  wateringButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  znooseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  znooseButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
  },
  chartVisual: {
    position: 'relative',
    width: '100%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendLine: {
    position: 'absolute',
    width: '80%',
    height: '60%',
  },
  trendPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  trendData: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 6,
    textAlign: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  trendIndicatorText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  cropDistributionWidget: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cropDistributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropDistributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  cropDistributionChart: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  donutChart: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  donutCenterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  donutCenterLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  cropLegend: {
    flex: 1,
  },
  cropLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: 'white',
    flex: 1,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 8,
  },
  legendHectares: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  cropImages: {
    flexDirection: 'row',
    gap: 16,
  },
  cropImageContainer: {
    alignItems: 'center',
  },
  cropImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cropImageLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  mandiContainer: {
    marginTop: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  viewAllText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mapContainer: {
    marginBottom: 16,
  },
  mapPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  mapIcon: {
    marginBottom: 8,
  },
  mapPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  mapPlaceholderText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 12,
  },
  mapCoordinates: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  coordinatesText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  mapStats: {
    flexDirection: 'row',
    gap: 20,
  },
  mapStat: {
    alignItems: 'center',
  },
  mapStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  mapStatLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  mandiCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mandiHeader: {
    marginBottom: 12,
  },
  mandiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mandiHeaderInfo: {
    marginLeft: 8,
    flex: 1,
  },
  mandiName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  mandiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  mandiStatusText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  mandiDetails: {
    marginBottom: 16,
  },
  mandiDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  mandiDetailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
    flex: 1,
  },
  mandiDetailTextHighlight: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  mandiActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  cropSelectorModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropOptionModal: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cropOptionModalSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  cropOptionTextModal: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  cropOptionTextModalSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  emptyListings: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyListingsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyListingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  emptyListingsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});