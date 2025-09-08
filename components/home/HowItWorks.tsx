import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const steps = [
  {
    icon: "microphone",
    title: "Ask Your Question",
    description: "Speak or type your farming query in Malayalam",
  },
  {
    icon: "brain",
    title: "AI Analysis",
    description: "Our AI processes your query with local context",
  },
  {
    icon: "lightbulb-on",
    title: "Get Solutions",
    description: "Receive instant, expert-backed solutions",
  },
  {
    icon: "account-group",
    title: "Expert Support",
    description: "Complex queries are handled by agricultural experts",
  },
];

const HowItWorks = () => {
  return (
    <View className="py-8 bg-green-50">
      <Text className="text-2xl font-bold text-green-800 px-4 mb-6">
        How It Works
      </Text>

      <View className="px-4">
        {steps.map((step, index) => (
          <View
            key={index}
            className="flex-row items-start bg-white rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="bg-green-100 rounded-full p-3 mr-4">
              <MaterialCommunityIcons
                name={step.icon as any}
                size={24}
                color="#16a34a"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-green-800 mb-1">
                {step.title}
              </Text>
              <Text className="text-gray-600">{step.description}</Text>
            </View>
            <Text className="text-3xl font-bold text-green-200">
              {index + 1}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default HowItWorks;
