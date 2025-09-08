import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const mockHistory = [
  {
    id: 1,
    question: "എന്റെ വാഴയിൽ ഇലപ്പുള്ളി രോഗം കണ്ടു. എന്ത് ചെയ്യണം?",
    answer: "വാഴയിലെ ഇലപ്പുള്ളി രോഗത്തിന് ട്രൈസൈക്ലാസോൾ 0.1% ലായനി തളിക്കുക...",
    date: "2024-03-15",
    category: "Disease",
  },
  {
    id: 2,
    question: "What is the best time to plant rice in Kerala?",
    answer:
      "The ideal time for rice planting in Kerala is during the Virippu season...",
    date: "2024-03-14",
    category: "Cultivation",
  },
  // Add more mock history items
];

const History = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-green-800 mb-6">
          Your Query History
        </Text>

        {mockHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="message-question"
                  size={20}
                  color="#16a34a"
                />
                <Text className="text-xs text-gray-500 ml-2">{item.date}</Text>
              </View>
              <View className="bg-green-100 px-2 py-1 rounded">
                <Text className="text-xs text-green-700">{item.category}</Text>
              </View>
            </View>

            <Text className="text-base font-medium text-gray-800 mb-2">
              {item.question}
            </Text>
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              {item.answer}
            </Text>

            <View className="flex-row justify-end mt-3">
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-green-600 text-sm mr-1">Read More</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={16}
                  color="#16a34a"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default History;
