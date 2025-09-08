import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const mockAlerts = [
  {
    type: "weather",
    title: "Heavy Rain Alert",
    description: "Heavy rainfall expected in your area in the next 48 hours",
    time: "2 hours ago",
    severity: "high",
    actions: ["Ensure proper drainage", "Protect harvested crops"],
  },
  {
    type: "scheme",
    title: "New Government Scheme",
    description: "Subsidy announced for organic farming certification",
    time: "1 day ago",
    severity: "medium",
    deadline: "March 31, 2024",
  },
  {
    type: "market",
    title: "Price Alert: Rice",
    description: "Rice prices expected to increase by 15% next week",
    time: "3 hours ago",
    severity: "medium",
  },
  {
    type: "disease",
    title: "Disease Risk: Paddy Blast",
    description: "High risk of paddy blast due to current weather conditions",
    time: "5 hours ago",
    severity: "high",
    actions: ["Apply preventive fungicide", "Monitor crop health"],
  },
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case "weather":
      return "weather-lightning";
    case "scheme":
      return "file-document";
    case "market":
      return "trending-up";
    case "disease":
      return "bug";
    default:
      return "alert";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
};

const Alerts = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-green-800">
            Recent Alerts
          </Text>
          <TouchableOpacity className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700">Filter</Text>
          </TouchableOpacity>
        </View>

        {mockAlerts.map((alert, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name={getAlertIcon(alert.type)}
                  size={24}
                  color="#16a34a"
                />
                <Text className="text-lg font-semibold text-gray-800 ml-2">
                  {alert.title}
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded-full ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <Text className="text-xs font-medium capitalize">
                  {alert.severity}
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 mb-3">{alert.description}</Text>

            {alert.actions && (
              <View className="bg-gray-50 p-3 rounded-lg mb-3">
                <Text className="font-medium text-gray-800 mb-2">
                  Recommended Actions:
                </Text>
                {alert.actions.map((action, idx) => (
                  <View key={idx} className="flex-row items-center mb-1">
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={16}
                      color="#16a34a"
                    />
                    <Text className="text-gray-600 ml-2">{action}</Text>
                  </View>
                ))}
              </View>
            )}

            {alert.deadline && (
              <View className="flex-row items-center mt-2">
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color="#4b5563"
                />
                <Text className="text-gray-600 ml-2">
                  Deadline: {alert.deadline}
                </Text>
              </View>
            )}

            <Text className="text-gray-400 text-sm mt-2">{alert.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Alerts;
