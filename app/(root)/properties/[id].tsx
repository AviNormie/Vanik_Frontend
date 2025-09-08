import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { farmingQueries, farmingFeatures } from "@/constants/data";

const QueryDetails = () => {
  const { id } = useLocalSearchParams();
  const queryId = parseInt(id as string) - 1;
  const query = farmingQueries[queryId] || farmingQueries[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{query.title}</Text>
        <Text style={styles.location}>{query.location}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {query.rating}</Text>
          <Text style={styles.category}>{query.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Query Details</Text>
        <Text style={styles.description}>
          This is a detailed agricultural advisory query about{" "}
          {query.title.toLowerCase()}. Our AI system provides comprehensive
          guidance and recommendations based on current farming practices and
          expert knowledge.
        </Text>

        <Text style={styles.sectionTitle}>Available Features</Text>
        <View style={styles.featuresContainer}>
          {farmingFeatures.slice(0, 4).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Expert Recommendations</Text>
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendation}>
            • Consult with local agricultural extension services
          </Text>
          <Text style={styles.recommendation}>
            • Monitor soil conditions regularly
          </Text>
          <Text style={styles.recommendation}>
            • Follow sustainable farming practices
          </Text>
          <Text style={styles.recommendation}>
            • Keep updated with weather forecasts
          </Text>
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
    backgroundColor: "#4a7c4a",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: "#e8f5e8",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rating: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  category: {
    fontSize: 14,
    color: "#e8f5e8",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5a2d",
    marginBottom: 12,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: "#4a7c4a",
    lineHeight: 24,
    marginBottom: 8,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 14,
    color: "#2d5a2d",
    fontWeight: "500",
  },
  recommendationsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendation: {
    fontSize: 14,
    color: "#4a7c4a",
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default QueryDetails;
