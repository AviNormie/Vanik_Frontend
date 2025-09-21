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
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { WalletService, Transaction } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';

export default function WalletScreen() {
  const { user, profile } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);

  // Determine user role
  const isFarmer = user?.role?.toLowerCase() === 'farmer' || profile?.role?.toLowerCase() === 'farmer';
  const isRetailer = user?.role?.toLowerCase() === 'retailer' || profile?.role?.toLowerCase() === 'retailer';

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const balance = await WalletService.getWalletBalance(user?.id || 'farmer1');
      setWalletBalance(balance);
      
      // Get real transactions from WalletService
      const realTransactions = await WalletService.getTransactions(user?.id || 'farmer1');
      setTransactions(realTransactions);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };



  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount');
      return;
    }

    if (!upiId.trim()) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID');
      return;
    }

    if (parseFloat(withdrawAmount) > walletBalance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your current balance');
      return;
    }

    try {
      const success = await WalletService.withdrawMoney(user?.id || 'farmer1', parseFloat(withdrawAmount), upiId);

      if (success) {
        Alert.alert(
          'Withdrawal Successful', 
          `₹${withdrawAmount} has been transferred to ${upiId}\n\nTransaction will be processed within 24 hours.`
        );
        await loadWalletData();
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setUpiId('');
      } else {
        Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount');
      return;
    }

    try {
      const success = await WalletService.topUpWallet(user?.id || 'retailer1', parseFloat(topUpAmount));

      if (success) {
        Alert.alert('Success', `₹${topUpAmount} added to your wallet successfully!`);
        await loadWalletData();
        setShowTopUpModal(false);
        setTopUpAmount('');
      } else {
        Alert.alert('Error', 'Failed to top up wallet. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to top up wallet. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={32} color="#16a34a" />
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>₹{walletBalance.toFixed(2)}</Text>
          
          {/* Different actions based on user role */}
          {isFarmer ? (
            <>
              {/* Farmers can only withdraw money they received from sales */}
              <TouchableOpacity
                style={styles.withdrawButtonFull}
                onPress={() => setShowWithdrawModal(true)}
              >
                <MaterialCommunityIcons name="bank-transfer" size={20} color="white" />
                <Text style={styles.withdrawButtonText}>Withdraw to Bank</Text>
              </TouchableOpacity>
              
              <View style={styles.walletNote}>
                <MaterialCommunityIcons name="information" size={16} color="#64748b" />
                <Text style={styles.walletNoteText}>
                  You receive money when retailers purchase your crops
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Retailers can top up their wallet and withdraw */}
              <View style={styles.walletActions}>
                <TouchableOpacity
                  style={styles.topUpButton}
                  onPress={() => setShowTopUpModal(true)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="white" />
                  <Text style={styles.topUpButtonText}>Add Money</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.withdrawButton}
                  onPress={() => setShowWithdrawModal(true)}
                >
                  <MaterialCommunityIcons name="bank-transfer" size={20} color="white" />
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.walletNote}>
                <MaterialCommunityIcons name="information" size={16} color="#64748b" />
                <Text style={styles.walletNoteText}>
                  Top up your wallet to purchase crops from farmers
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trending-up" size={24} color="#16a34a" />
            <Text style={styles.statValue}>₹{transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0).toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="handshake" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{transactions.filter(t => t.type === 'credit' && t.description.includes('Payment received')).length}</Text>
            <Text style={styles.statLabel}>Completed Sales</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <MaterialCommunityIcons name="receipt" size={64} color="#9ca3af" />
              <Text style={styles.emptyTransactionsTitle}>No transactions yet</Text>
              <Text style={styles.emptyTransactionsText}>
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <MaterialCommunityIcons
                    name={transaction.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}
                    size={20}
                    color={transaction.type === 'credit' ? '#16a34a' : '#dc2626'}
                  />
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                </View>
                
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText,
                    { color: transaction.type === 'credit' ? '#16a34a' : '#dc2626' }
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    transaction.status === 'completed' && styles.statusCompleted,
                    transaction.status === 'pending' && styles.statusPending,
                    transaction.status === 'failed' && styles.statusFailed,
                  ]}>
                    <Text style={styles.statusText}>{transaction.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Top-up Modal for Retailers */}
      <Modal visible={showTopUpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.currentBalanceInfo}>
                <Text style={styles.currentBalanceLabel}>Current Balance</Text>
                <Text style={styles.currentBalanceAmount}>₹{walletBalance.toFixed(2)}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount to Add</Text>
                <TextInput
                  style={styles.input}
                  value={topUpAmount}
                  onChangeText={setTopUpAmount}
                  placeholder="Enter amount to add"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.quickAmounts}>
                <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
                <View style={styles.quickAmountButtons}>
                  {['1000', '2000', '5000', '10000'].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.quickAmountButton}
                      onPress={() => setTopUpAmount(amount)}
                    >
                      <Text style={styles.quickAmountButtonText}>₹{amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.withdrawInfo}>
                <Text style={styles.withdrawInfoTitle}>Payment Information:</Text>
                <Text style={styles.withdrawInfoText}>• Instant credit to wallet</Text>
                <Text style={styles.withdrawInfoText}>• Secure payment gateway</Text>
                <Text style={styles.withdrawInfoText}>• No additional charges</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={handleTopUp}
            >
              <Text style={styles.addMoneyButtonText}>Add Money</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Money</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.currentBalanceInfo}>
                <Text style={styles.currentBalanceLabel}>Available Balance</Text>
                <Text style={styles.currentBalanceAmount}>₹{walletBalance.toFixed(2)}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Withdrawal Amount</Text>
                <TextInput
                  style={styles.input}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder="Enter amount to withdraw"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>UPI ID</Text>
                <TextInput
                  style={styles.input}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="Enter your UPI ID (e.g., farmer@paytm)"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.withdrawInfo}>
                <Text style={styles.withdrawInfoTitle}>Withdrawal Information:</Text>
                <Text style={styles.withdrawInfoText}>• Processing time: 24 hours</Text>
                <Text style={styles.withdrawInfoText}>• No withdrawal fees</Text>
                <Text style={styles.withdrawInfoText}>• Minimum withdrawal: ₹100</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.withdrawSubmitButton}
              onPress={handleWithdraw}
            >
              <Text style={styles.withdrawSubmitButtonText}>Withdraw Money</Text>
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
    backgroundColor: '#f0fdf4',
  },
  header: {
    padding: 25,
    paddingTop: 60,
    backgroundColor: '#059669',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 12,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  topUpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  topUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  walletNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  walletNoteText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  transactionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTransactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusFailed: {
    backgroundColor: '#fecaca',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
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
  currentBalanceInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentBalanceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  currentBalanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
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
  quickAmounts: {
    marginBottom: 20,
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickAmountButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  addMoneyButton: {
    backgroundColor: '#16a34a',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addMoneyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  withdrawInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  withdrawInfoText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
  },
  withdrawSubmitButton: {
    backgroundColor: '#3b82f6',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});