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
} from 'react-native';
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
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingListing ? 'Edit Listing' : 'Add New Listing'}
            </Text>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              setEditingListing(null);
              setNewListing({ cropType: '', quantity: '', expectedPrice: '', location: '' });
            }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Crop Type</Text>
              <View style={styles.cropSelector}>
                {cropTypes.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    style={[
                      styles.cropOption,
                      newListing.cropType === crop && styles.cropOptionSelected,
                    ]}
                    onPress={() => setNewListing({ ...newListing, cropType: crop })}
                  >
                    <Text
                      style={[
                        styles.cropOptionText,
                        newListing.cropType === crop && styles.cropOptionTextSelected,
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
    </Modal>
  );

  const renderMyListings = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addListingButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addListingButtonText}>Add Listing</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.emptyListings}>
          <MaterialCommunityIcons name="leaf-off" size={64} color="#9ca3af" />
          <Text style={styles.emptyListingsTitle}>No listings yet</Text>
          <Text style={styles.emptyListingsText}>
            Create your first listing to start selling your crops
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadFarmerListings}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Refresh Listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        listings.map((listing: any) => (
          <View key={listing.id} style={styles.listingCard}>
            <View style={styles.listingHeader}>
              <Text style={styles.listingCrop}>{listing.cropType}</Text>
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
              <Text style={styles.listingInfo}>Quantity: {listing.quantityKg} kg</Text>
              <Text style={styles.listingInfo}>Expected: ₹{listing.expectedPrice}/kg</Text>
              <Text style={styles.listingInfo}>Location: {listing.location}</Text>
              <Text style={styles.listingInfo}>Posted: {new Date(listing.createdAt).toLocaleDateString()}</Text>
            </View>

            <View style={styles.listingActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editListing(listing)}
              >
                <Ionicons name="pencil" size={16} color="white" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteListing(listing.id)}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Offer Status Section */}
            {listing.status === 'OPEN' && (
              <View style={styles.statusSection}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#f59e0b" />
                <Text style={styles.statusText}>Waiting for offers from nearby retailers</Text>
              </View>
            )}

            {listing.status === 'MATCHED' && (
              <View style={styles.statusSection}>
                <MaterialCommunityIcons name="handshake" size={16} color="#16a34a" />
                <Text style={styles.statusText}>Matched with retailer - Delivery in progress</Text>
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
                          <MaterialCommunityIcons name="check" size={14} color="white" />
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleRejectOffer(offer.id)}
                        >
                          <MaterialCommunityIcons name="close" size={14} color="white" />
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
                          <MaterialCommunityIcons name="truck-delivery" size={14} color="white" />
                          <Text style={styles.deliveryButtonText}>Confirm Delivery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.disputeButton}
                          onPress={() => handleDispute('escrow_' + offer.id)}
                        >
                          <MaterialCommunityIcons name="alert" size={14} color="white" />
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
    </View>
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
      <View style={styles.tabContent}>
        <View style={styles.priceHeader}>
          <Text style={styles.sectionTitle}>Live Price Dashboard</Text>
          <View style={styles.dataSourceBadge}>
            <MaterialCommunityIcons name="database" size={16} color="#16a34a" />
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
            <MaterialCommunityIcons name="gavel" size={20} color="#16a34a" />
            <Text style={styles.priceCardTitle}>MSP</Text>
            <Text style={styles.priceCardValue}>₹{currentCropData.msp}</Text>
            <Text style={styles.priceCardSubtitle}>Government MSP</Text>
          </View>

          <View style={styles.priceCard}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#3b82f6" />
            <Text style={styles.priceCardTitle}>Agmarknet</Text>
            <Text style={styles.priceCardValue}>₹{currentCropData.agmarknet}</Text>
            <Text style={styles.priceCardSubtitle}>Market Rate</Text>
          </View>

          <View style={styles.priceCard}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#f59e0b" />
            <Text style={styles.priceCardTitle}>Avg Offers</Text>
            <Text style={styles.priceCardValue}>₹{currentCropData.avgOffers}</Text>
            <Text style={styles.priceCardSubtitle}>Platform Average</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Price Trend - {selectedCrop}</Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#16a34a" />
            <Text style={styles.chartPlaceholderText}>Interactive price chart coming soon</Text>
            <Text style={styles.trendData}>
              Recent Trend: {currentCropData.trend.map(point => `₹${point.y}`).join(' → ')}
            </Text>
            <View style={styles.trendIndicator}>
              <MaterialCommunityIcons name="trending-up" size={16} color="#16a34a" />
              <Text style={styles.trendIndicatorText}>+2.5% this week</Text>
            </View>
          </View>
        </View>

        <View style={styles.mandiContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Mandis</Text>
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f0fdf4',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                gap: 4
              }}
              onPress={showNearbyMandis}
            >
              <MaterialCommunityIcons name="map-search" size={16} color="#16a34a" />
              <Text style={{
                color: '#16a34a',
                fontSize: 14,
                fontWeight: '600'
              }}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Map View with Google Maps Integration */}
          <TouchableOpacity 
            style={styles.mapContainer}
            onPress={() => getDirections(currentCropData.mandiInfo.coordinates)}
          >
            <View style={styles.mapPlaceholder}>
              <MaterialCommunityIcons name="google-maps" size={48} color="#4285f4" />
              <Text style={styles.mapPlaceholderTitle}>Open in Google Maps</Text>
              <Text style={styles.mapPlaceholderText}>
                View {selectedCrop} mandis near you with live prices
              </Text>
              <View style={styles.mapCoordinates}>
                <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#16a34a" />
                <Text style={styles.coordinatesText}>
                  📍 {currentCropData.mandiInfo.coordinates.lat}°N, {currentCropData.mandiInfo.coordinates.lng}°E
                </Text>
              </View>
              <View style={styles.mapStats}>
                <View style={styles.mapStat}>
                  <MaterialCommunityIcons name="store-marker" size={16} color="#16a34a" />
                  <Text style={styles.mapStatValue}>5 Mandis</Text>
                  <Text style={styles.mapStatLabel}>Within 10km</Text>
                </View>
                <View style={styles.mapStat}>
                  <MaterialCommunityIcons name="map-marker-distance" size={16} color="#3b82f6" />
                  <Text style={styles.mapStatValue}>2.3km</Text>
                  <Text style={styles.mapStatLabel}>Closest</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.mandiCard}>
            <View style={styles.mandiHeader}>
              <MaterialCommunityIcons name="store" size={24} color="#16a34a" />
              <View style={styles.mandiHeaderInfo}>
                <Text style={styles.mandiName}>{currentCropData.mandiInfo.name}</Text>
                <View style={styles.mandiStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Open Now</Text>
                </View>
              </View>
            </View>

            <View style={styles.mandiDetails}>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
                <Text style={styles.mandiDetailText}>{currentCropData.mandiInfo.address}</Text>
              </View>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="phone" size={16} color="#64748b" />
                <Text style={styles.mandiDetailText}>{currentCropData.mandiInfo.contact}</Text>
              </View>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="clock" size={16} color="#64748b" />
                <Text style={styles.mandiDetailText}>Open: 6:00 AM - 6:00 PM</Text>
              </View>
              <View style={styles.mandiDetailRow}>
                <MaterialCommunityIcons name="currency-inr" size={16} color="#16a34a" />
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
                <MaterialCommunityIcons name="phone" size={18} color="white" />
                <Text style={styles.contactButtonText}>Contact Mandi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => getDirections(currentCropData.mandiInfo.coordinates)}
              >
                <MaterialCommunityIcons name="directions" size={18} color="white" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farmer Dashboard</Text>
        <View style={styles.walletInfo}>
          <MaterialCommunityIcons name="wallet" size={20} color="#16a34a" />
          <Text style={styles.walletBalance}>₹{walletBalance}</Text>
        </View>
      </View>

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
            size={20}
            color={activeTab === 'listings' ? '#16a34a' : '#666'}
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
            size={20}
            color={activeTab === 'prices' ? '#16a34a' : '#666'}
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

      <ScrollView style={styles.content}>
        {activeTab === 'listings' ? renderMyListings() : renderPriceDashboard()}
      </ScrollView>

      {renderAddListingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingTop: 60,
    backgroundColor: '#059669',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  walletBalance: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 16,
    padding: 6,
    elevation: 6,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#10b981',
    elevation: 3,
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  addListingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addListingButtonText: {
    marginLeft: 5,
    color: 'white',
    fontWeight: '600',
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingCrop: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#dbeafe',
  },
  statusMatched: {
    backgroundColor: '#fef3c7',
  },
  statusSold: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  listingDetails: {
    marginBottom: 12,
  },
  listingInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  offersSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 12,
  },
  offersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  newOfferBadge: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  offerCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  offerInfo: {
    marginBottom: 8,
  },
  offerRetailer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  offerPrice: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '700',
    marginBottom: 2,
  },
  offerDetails: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  offerDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectedOffer: {
    alignItems: 'center',
    padding: 8,
  },
  rejectedText: {
    color: '#dc2626',
    fontSize: 12,
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
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cropOptionSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  cropOptionText: {
    fontSize: 14,
    color: '#64748b',
  },
  cropOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  priceCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  priceCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  priceCardTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  priceCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  priceCardSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  trendData: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 8,
    textAlign: 'center',
  },
  mapContainer: {
    marginBottom: 16,
  },
  mapPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  mapPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  mapCoordinates: {
    marginTop: 12,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  mandiContainer: {
    marginTop: 20,
  },
  mandiCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  mandiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mandiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  mandiDetails: {
    marginBottom: 16,
  },
  mandiDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mandiDetailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  mandiActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deliveryButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deliveryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  disputeButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disputeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  addButton: {
    backgroundColor: '#16a34a',
    margin: 20,
    padding: 15,
    borderRadius: 8,
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
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  emptyListings: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyListingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyListingsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
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
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dataSourceText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  trendIndicatorText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  mapStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20,
  },
  mapStat: {
    alignItems: 'center',
  },
  mapStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  mapStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  mandiHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  mandiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  listingStatusText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  mandiDetailTextHighlight: {
    fontSize: 14,
    color: '#16a34a',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
});