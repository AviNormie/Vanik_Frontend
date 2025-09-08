import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const languages = [
  { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

const LanguageSelector = () => {
  const [selectedLang, setSelectedLang] = React.useState("ml");

  return (
    <View className="bg-white py-6 px-4">
      <View className="flex-row items-center mb-4">
        <MaterialCommunityIcons
          name="translate"
          size={24}
          color="#16a34a"
          style={{ marginRight: 8 }}
        />
        <Text className="text-lg font-semibold text-green-800">
          Select Your Language
        </Text>
      </View>

      <View className="flex-row gap-4">
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => setSelectedLang(lang.code)}
            className={`flex-1 border-2 rounded-xl p-4 items-center ${
              selectedLang === lang.code
                ? "border-green-600 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <Text className="text-2xl mb-2">{lang.flag}</Text>
            <Text
              className={`font-medium ${
                selectedLang === lang.code ? "text-green-800" : "text-gray-600"
              }`}
            >
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default LanguageSelector;
