import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const tabs = [
  {
    name: "Home",
    href: "/",
    icon: "home",
  },
  {
    name: "Market",
    href: "/market",
    icon: "store",
  },
  {
    name: "Ask AI",
    href: "/ask",
    icon: "microphone",
  },
  {
    name: "Weather",
    href: "/weather",
    icon: "weather-partly-cloudy",
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: "bell",
  },
];

const BottomTabs = () => {
  const pathname = usePathname();

  return (
    <View className="flex-row justify-around items-center bg-white border-t border-gray-200 pb-6 pt-2 px-4">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.name} href={tab.href} asChild>
            <TouchableOpacity
              className={`items-center ${tab.name === "Ask" ? "-mt-8" : ""}`}
            >
              {tab.name === "Ask" ? (
                <View className="bg-green-600 p-4 rounded-full -mt-4">
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={28}
                    color="white"
                  />
                </View>
              ) : (
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={24}
                  color={isActive ? "#16a34a" : "#6b7280"}
                />
              )}
              <Text
                className={`text-xs mt-1 ${
                  isActive ? "text-green-600" : "text-gray-500"
                }`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
};

export default BottomTabs;
