import { ScrollView, View, SafeAreaView } from "react-native";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HowItWorks from "@/components/home/HowItWorks";
import LanguageSelector from "@/components/home/LanguageSelector";
import BottomTabs from "@/components/shared/BottomTabs";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HeroSection />
        <LanguageSelector />
        <FeaturesSection />
        <HowItWorks />
        <View className="h-20" /> {/* Bottom padding for content */}
      </ScrollView>
      <BottomTabs />
    </SafeAreaView>
  );
}
