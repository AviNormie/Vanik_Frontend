import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { farmingQueries, categories } from "@/constants/data";

const explore = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Explore Farming Solutions</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Queries</Text>
        {farmingQueries.map((query, index) => (
          <View key={index} style={styles.queryCard}>
            <Text style={styles.queryTitle}>{query.title}</Text>
            <Text style={styles.queryLocation}>{query.location}</Text>
            <Text style={styles.queryCategory}>{query.category}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8f0",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d5a2d",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a7c4a",
    marginBottom: 12,
  },
  queryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  queryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d5a2d",
    marginBottom: 4,
  },
  queryLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  queryCategory: {
    fontSize: 12,
    color: "#4a7c4a",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#4a7c4a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default explore;
