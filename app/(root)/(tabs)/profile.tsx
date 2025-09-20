import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0); // Initial wallet balance set to ₹0
  
  const mockTransactions = [
    {
      id: "1",
      type: user?.role?.toLowerCase() === 'retailer' ? "payment" : "received",
      amount: user?.role?.toLowerCase() === 'retailer' ? -200 : 200,
      description: user?.role?.toLowerCase() === 'retailer' ? "Payment to Rajesh Kumar" : "Payment from City Fresh Market",
      date: "2 hours ago",
      status: "completed"
    },
    {
      id: "2",
      type: user?.role?.toLowerCase() === 'retailer' ? "topup" : "received",
      amount: user?.role?.toLowerCase() === 'retailer' ? 500 : 150,
      description: user?.role?.toLowerCase() === 'retailer' ? "Wallet Top-up" : "Payment from Green Grocers",
      date: "1 day ago",
      status: "completed"
    },
    {
      id: "3",
      type: "escrow",
      amount: user?.role?.toLowerCase() === 'retailer' ? -300 : 0,
      description: user?.role?.toLowerCase() === 'retailer' ? "Escrow - Pending delivery" : "Escrow transaction pending",
      date: "2 days ago",
      status: "pending"
    }
  ];

  const handleTopUp = () => {
    Alert.alert(
      "Top Up Wallet",
      "Choose amount to add:",
      [
        { text: "₹500", onPress: () => addFunds(500) },
        { text: "₹1000", onPress: () => addFunds(1000) },
        { text: "₹2000", onPress: () => addFunds(2000) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const addFunds = (amount: number) => {
    setWalletBalance(prev => prev + amount);
    Alert.alert("Success", `₹${amount} added to your wallet!`);
  };

  const handleWithdraw = () => {
    if (walletBalance < 100) {
      Alert.alert("Error", "Minimum balance of ₹100 required for withdrawal");
      return;
    }
    Alert.alert(
      "Withdraw Funds",
      "Choose amount to withdraw:",
      [
        { text: "₹100", onPress: () => withdrawFunds(100) },
        { text: "₹500", onPress: () => withdrawFunds(500) },
        { text: "₹1000", onPress: () => withdrawFunds(1000) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const withdrawFunds = (amount: number) => {
    if (amount > walletBalance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }
    setWalletBalance(prev => prev - amount);
    Alert.alert("Success", `₹${amount} withdrawn from your wallet!`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{user?.role === 'farmer' ? 'Farmer' : 'Retailer'} Profile</Text>
        <Text style={styles.subtitle}>
          {user?.name || user?.phoneNumber}
        </Text>
      </View>

      {/* Wallet Section */}
      <View style={styles.walletSection}>
        <View style={styles.walletHeader}>
          <MaterialCommunityIcons name="wallet" size={24} color="#4a7c4a" />
          <Text style={styles.walletTitle}>My Wallet</Text>
        </View>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{walletBalance.toLocaleString()}</Text>
          
          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTopUp}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Top Up</Text>
            </TouchableOpacity>
            
            {user?.role === 'farmer' && (
              <TouchableOpacity style={[styles.actionButton, styles.withdrawButton]} onPress={handleWithdraw}>
                <MaterialCommunityIcons name="bank-transfer-out" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {mockTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <MaterialCommunityIcons 
                name={
                  transaction.type === 'payment' ? 'arrow-up' :
                  transaction.type === 'received' ? 'arrow-down' :
                  transaction.type === 'topup' ? 'plus' : 'clock'
                } 
                size={20} 
                color={
                  transaction.amount > 0 ? '#16a34a' : 
                  transaction.status === 'pending' ? '#f59e0b' : '#dc2626'
                } 
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.amountText,
                { color: transaction.amount > 0 ? '#16a34a' : '#dc2626' }
              ]}>
                {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
              </Text>
              <Text style={[
                styles.statusText,
                { color: transaction.status === 'completed' ? '#16a34a' : '#f59e0b' }
              ]}>
                {transaction.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Activity Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.role === 'farmer' ? '12' : '8'}</Text>
            <Text style={styles.statLabel}>{user?.role === 'farmer' ? 'Listings Created' : 'Orders Placed'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.role === 'farmer' ? '₹15,200' : '₹8,500'}</Text>
            <Text style={styles.statLabel}>{user?.role === 'farmer' ? 'Total Earned' : 'Total Spent'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8f0",
  },
  header: {
    padding: 20,
    backgroundColor: "#4a7c4a",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#e8f5e8",
  },
  walletSection: {
    padding: 16,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5a2d",
    marginLeft: 8,
  },
  balanceCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4a7c4a",
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#4a7c4a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButton: {
    backgroundColor: "#dc2626",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  transactionSection: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d5a2d",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  settingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5a2d",
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  settingTitle: {
    fontSize: 16,
    color: "#2d5a2d",
  },
  statsSection: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a7c4a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default Profile;
