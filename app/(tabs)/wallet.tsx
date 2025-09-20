import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { WalletService, Escrow } from '../../services/walletService';

export default function FarmerWalletPage() {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'payments' | 'escrows'>('overview');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 'farmer1';
      
      const [balance, userEscrows] = await Promise.all([
        WalletService.getWalletBalance(userId),
        WalletService.getUserEscrows(userId)
      ]);
      
      setWalletBalance(balance);
      setEscrows(userEscrows);
      
      // Mock transaction history for farmers
      setTransactions([
        { id: '1', type: 'payment_received', amount: 5000, date: '2024-01-15', from: 'ABC Traders', crop: 'Rice' },
        { id: '2', type: 'payment_received', amount: 3200, date: '2024-01-10', from: 'XYZ Corp', crop: 'Wheat' },
        { id: '3', type: 'withdrawal', amount: -2000, date: '2024-01-08', to: 'Bank Account' },
      ]);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > walletBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      Alert.alert('Success', `₹${withdrawAmount} withdrawal request submitted. Funds will be transferred to your bank account within 2-3 business days.`);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal');
    }
  };

  const renderOverview = () => (
    <View style={styles.content}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹{walletBalance.toLocaleString()}</Text>
        <TouchableOpacity 
          style={styles.withdrawButton}
          onPress={() => setShowWithdrawModal(true)}
        >
          <MaterialCommunityIcons name="bank-transfer" size={20} color="white" />
          <Text style={styles.withdrawButtonText}>Withdraw to Bank</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color="#059669" />
          <Text style={styles.statValue}>₹{transactions.filter(t => t.type === 'payment_received').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="handshake" size={24} color="#d97706" />
          <Text style={styles.statValue}>{escrows.length}</Text>
          <Text style={styles.statLabel}>Active Deals</Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Payments</Text>
        {transactions.slice(0, 3).map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionIcon}>
              <MaterialCommunityIcons 
                name={transaction.type === 'payment_received' ? 'arrow-down-circle' : 'arrow-up-circle'} 
                size={24} 
                color={transaction.type === 'payment_received' ? '#059669' : '#dc2626'} 
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>
                {transaction.type === 'payment_received' ? `Payment from ${transaction.from}` : 'Bank Withdrawal'}
              </Text>
              <Text style={styles.transactionSubtitle}>
                {transaction.crop ? `${transaction.crop} • ` : ''}{transaction.date}
              </Text>
            </View>
            <Text style={[styles.transactionAmount, { color: transaction.type === 'payment_received' ? '#059669' : '#dc2626' }]}>
              {transaction.type === 'payment_received' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPayments = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Payment History</Text>
      {transactions.map((transaction) => (
        <View key={transaction.id} style={styles.transactionCard}>
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons 
              name={transaction.type === 'payment_received' ? 'arrow-down-circle' : 'arrow-up-circle'} 
              size={24} 
              color={transaction.type === 'payment_received' ? '#059669' : '#dc2626'} 
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>
              {transaction.type === 'payment_received' ? `Payment from ${transaction.from}` : 'Bank Withdrawal'}
            </Text>
            <Text style={styles.transactionSubtitle}>
              {transaction.crop ? `${transaction.crop} • ` : ''}{transaction.date}
            </Text>
          </View>
          <Text style={[styles.transactionAmount, { color: transaction.type === 'payment_received' ? '#059669' : '#dc2626' }]}>
            {transaction.type === 'payment_received' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderEscrows = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Active Deals</Text>
      {escrows.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="handshake-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyStateText}>No active deals</Text>
        </View>
      ) : (
        escrows.map((escrow) => (
          <View key={escrow.id} style={styles.escrowCard}>
            <View style={styles.escrowHeader}>
              <Text style={styles.escrowTitle}>Deal #{escrow.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: escrow.status === 'LOCKED' ? '#fef3c7' : '#dcfce7' }]}>
               <Text style={styles.statusText}>{escrow.status.toUpperCase()}</Text>
             </View>
           </View>
           <Text style={styles.escrowAmount}>₹{escrow.amountLocked.toLocaleString()}</Text>
            <Text style={styles.escrowDetails}>Waiting for delivery confirmation</Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Farmer Wallet</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[{ key: 'overview', label: 'Overview' }, { key: 'payments', label: 'Payments' }, { key: 'escrows', label: 'Deals' }].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'payments' && renderPayments()}
        {selectedTab === 'escrows' && renderEscrows()}
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw to Bank</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Amount to Withdraw</Text>
              <TextInput
                style={styles.input}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
              <Text style={styles.balanceInfo}>Available: ₹{walletBalance.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
              <Text style={styles.withdrawButtonText}>Submit Withdrawal Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  escrowCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  escrowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  escrowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  escrowAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  escrowDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  balanceInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },
});