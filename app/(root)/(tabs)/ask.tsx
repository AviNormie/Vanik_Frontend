import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const mockContext = {
  location: "Thrissur, Kerala",
  mainCrop: "Rice (Matta)",
  soilType: "Clayey",
  cropStage: "Vegetative",
  lastActivity: "Applied fertilizer 5 days ago",
};

const Ask = () => {
  const [isRecording, setIsRecording] = React.useState(false);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Context Card */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons
              name="information"
              size={24}
              color="#16a34a"
            />
            <Text className="text-lg font-semibold text-green-800 ml-2">
              Your Farming Context
            </Text>
          </View>

          {Object.entries(mockContext).map(([key, value]) => (
            <View
              key={key}
              className="flex-row items-center py-2 border-b border-gray-100"
            >
              <Text className="text-gray-600 w-1/3 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}:
              </Text>
              <Text className="text-gray-800 flex-1 font-medium">{value}</Text>
            </View>
          ))}
        </View>

        {/* Voice Input */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm items-center">
          <Text className="text-xl font-semibold text-green-800 mb-2 text-center">
            Ask in Malayalam
          </Text>
          <Text className="text-gray-600 mb-6 text-center">
            Your context will be automatically considered
          </Text>

          <TouchableOpacity
            onPress={() => setIsRecording(!isRecording)}
            className={`p-8 rounded-full ${
              isRecording ? "bg-red-500" : "bg-green-600"
            }`}
          >
            <MaterialCommunityIcons
              name={isRecording ? "stop" : "microphone"}
              size={40}
              color="white"
            />
          </TouchableOpacity>

          <Text className="text-sm text-gray-500 mt-4">
            {isRecording ? "Recording..." : "Tap to start recording"}
          </Text>
        </View>

        {/* Text Input */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-green-800 mb-4">
            Type Your Question
          </Text>
          <TextInput
            placeholder="എന്റെ നെല്ലിന് ഇലകളിൽ കറുത്ത പാടുകൾ കാണുന്നു..."
            multiline
            numberOfLines={4}
            className="bg-gray-50 rounded-xl p-4 text-base"
            textAlignVertical="top"
          />
          <TouchableOpacity className="bg-green-600 rounded-full py-3 mt-4">
            <Text className="text-white font-semibold text-center">
              Get Answer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Ask;
