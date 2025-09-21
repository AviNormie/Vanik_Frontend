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
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { WalletService } from '../../services/walletService';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import FloatingAIAssistant from '../../components/shared/FloatingAIAssistant';
// Chart functionality will be added later when victory-native is installed

const { width } = Dimensions.get('window');

// Remove mock data - will use real API data

const mockPriceData: Record<string, {
  msp: number;
  agmarknet: number;
  avgOffers: number;
  trend: { x: number; y: number }[];
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

  useEffect(() => {
    loadWalletBalance();
    loadFarmerListings();
  }, []);

  const loadFarmerListings = async () => {
    try {
      setLoading(true);
      const farmerListings = await apiService.getFarmerListings();
      setListings(farmerListings);
    } catch (error) {
      console.error('Error loading farmer listings:', error);
      Alert.alert('Error', 'Failed to load your listings');
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

    try {
      await apiService.createListing({
        cropType: newListing.cropType,
        quantityKg: parseInt(newListing.quantity),
        expectedPrice: parseFloat(newListing.expectedPrice),
        location: newListing.location,
      });
      
      Alert.alert('Success', 'Listing added successfully!');
      setShowAddModal(false);
      setNewListing({ cropType: '', quantity: '', expectedPrice: '', location: '' });
      loadFarmerListings(); // Refresh listings
    } catch (error) {
      console.error('Error adding listing:', error);
      Alert.alert('Error', 'Failed to add listing. Please try again.');
    }
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
            <Text style={styles.modalTitle}>Add New Listing</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
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
            <Text style={styles.addButtonText}>Add Listing</Text>
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
      
      {listings.map((listing: any) => (
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
            <Text style={styles.listingInfo}>Quantity: {listing.quantity} kg</Text>
            <Text style={styles.listingInfo}>Expected: ₹{listing.expectedPrice}/kg</Text>
            <Text style={styles.listingInfo}>Location: {listing.location}</Text>
            <Text style={styles.listingInfo}>Posted: {listing.datePosted}</Text>
          </View>
          
          {listing.offers.length > 0 && (
            <View style={styles.offersSection}>
              <Text style={styles.offersTitle}>Offers Received ({listing.offers.length})</Text>
              {listing.offers.map((offer: any) => (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerRetailer}>{offer.retailer}</Text>
                    <Text style={styles.offerPrice}>₹{offer.price}/kg for {offer.quantity}kg</Text>
                  </View>
                  {offer.status === 'pending' && (
                    <View style={styles.offerActions}>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAcceptOffer(offer.id, 'escrow_' + offer.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => handleRejectOffer(offer.id)}
                      >
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
                        <Text style={styles.deliveryButtonText}>Confirm Delivery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.disputeButton}
                        onPress={() => handleDispute('escrow_' + offer.id)}
                      >
                        <Text style={styles.disputeButtonText}>Dispute</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderPriceDashboard = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Reference Price Dashboard</Text>
      
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
          <Text style={styles.priceCardTitle}>MSP</Text>
          <Text style={styles.priceCardValue}>₹{mockPriceData[selectedCrop].msp}</Text>
          <Text style={styles.priceCardSubtitle}>Government MSP</Text>
        </View>
        
        <View style={styles.priceCard}>
          <Text style={styles.priceCardTitle}>Agmarknet</Text>
          <Text style={styles.priceCardValue}>₹{mockPriceData[selectedCrop].agmarknet}</Text>
          <Text style={styles.priceCardSubtitle}>Market Rate</Text>
        </View>
        
        <View style={styles.priceCard}>
          <Text style={styles.priceCardTitle}>Avg Offers</Text>
          <Text style={styles.priceCardValue}>₹{mockPriceData[selectedCrop].avgOffers}</Text>
          <Text style={styles.priceCardSubtitle}>Platform Average</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Price Trend - {selectedCrop}</Text>
        <View style={styles.chartPlaceholder}>
          <MaterialCommunityIcons name="chart-line" size={48} color="#16a34a" />
          <Text style={styles.chartPlaceholderText}>Chart will be available when victory-native is installed</Text>
          <Text style={styles.trendData}>
            Trend: {mockPriceData[selectedCrop].trend.map(point => `₹${point.y}`).join(' → ')}
          </Text>
        </View>
      </View>
    </View>
  );

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
      <FloatingAIAssistant />
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
  offersSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  offersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  offerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  offerInfo: {
    flex: 1,
  },
  offerRetailer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  offerPrice: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectButtonText: {
    color: 'white',
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
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
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
    width: width - 40,
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
    marginBottom: 20,
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
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  trendData: {
    fontSize: 12,
    color: '#16a34a',
    textAlign: 'center',
    fontWeight: '500',
  },
  deliveryButton: {
    backgroundColor: '#059669',
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
    backgroundColor: '#d97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disputeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});