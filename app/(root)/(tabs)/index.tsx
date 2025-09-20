import LogoutButton from "@/components/shared/LogoutButton";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { router, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Index() {
  const { user } = useAuth();
  const routerInstance = useRouter();

  const handleMarketplaceNavigation = () => {
    if (!user) {
      Alert.alert("Error", "Please log in to access the marketplace");
      return;
    }

    // Navigate to marketplace based on user role
    const userRole = user.role?.toLowerCase();
    if (userRole === 'farmer') {
      router.push('/farmer-dashboard' as any);
    } else if (userRole === 'retailer') {
      router.push('/retailer-dashboard' as any);
    } else {
      Alert.alert("Access Denied", "Please complete your profile setup to access marketplace features");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => routerInstance.canGoBack() ? routerInstance.back() : null}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#2d5a2d" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>AI-Based Farmer Query Support</Text>
      <Text style={styles.subtitle}>Get expert agricultural advice and support</Text>
      
      {/* Marketplace Button */}
      <TouchableOpacity 
        style={styles.marketplaceButton} 
        onPress={handleMarketplaceNavigation}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="store" size={24} color="white" />
        <Text style={styles.marketplaceButtonText}>
          {user?.role?.toLowerCase() === 'farmer' ? 'Sell Your Crops' : user?.role?.toLowerCase() === 'retailer' ? 'Browse Marketplace' : 'Access Marketplace'}
        </Text>
      </TouchableOpacity>

      {user && (
        <Text style={styles.roleText}>Logged in as: {user.role?.toLowerCase() || 'Unknown'}</Text>
      )}
      
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8f0",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d5a2d",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#4a7c4a",
    textAlign: "center",
    marginBottom: 30,
  },
  marketplaceButton: {
    backgroundColor: "#2d5a2d",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  marketplaceButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  roleText: {
    fontSize: 14,
    color: "#4a7c4a",
    marginBottom: 20,
    fontStyle: "italic",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2d5a2d",
  },
  backButtonText: {
    color: "#2d5a2d",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
});
