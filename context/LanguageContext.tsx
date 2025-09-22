import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'hindi' | 'english' | 'malayalam';

type TranslationKey = 
  | 'welcomeFarmer' | 'welcomeRetailer' | 'welcomeFarmerEng' | 'welcomeRetailerEng' | 'user'
  | 'todaysWeather' | 'weatherLoading' | 'weatherNotAvailable' | 'humidity' | 'wind' | 'rain'
  | 'farmingActivities' | 'fieldPreparation' | 'sowingSeason' | 'cropCare' | 'harvestTime'
  | 'quickServices' | 'cropDisease' | 'weather' | 'wallet' | 'market'
  | 'todaysTips' | 'irrigationTip' | 'priceTip' | 'selectLanguage'
    | 'welcome' | 'farmer' | 'retailer' | 'todayFarming' | 'weatherInfo' | 'todayWeather'
    | 'todayTips' | 'cropAdvice' | 'todayRecommendations' | 'marketPrices'
    | 'todayPrices' | 'aiAssistant' | 'getInstantHelp' | 'loadingWeather' | 'wheatPriceTip'
    | 'home' | 'profile' | 'settings' | 'logout' | 'language'
    | 'quickActions'
  | 'weatherUpdate'
  | 'market';

type Translations = Record<Language, Record<TranslationKey, string>>;

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Translations = {
  hindi: {
    // Welcome messages
    welcomeFarmer: 'नमस्ते किसान जी',
    welcomeRetailer: 'नमस्ते व्यापारी जी',
    welcomeFarmerEng: 'Welcome Farmer',
    welcomeRetailerEng: 'Welcome Retailer',
    user: 'उपयोगकर्ता',
    
    // Weather section
    todaysWeather: 'आज का मौसम',
    weatherLoading: 'मौसम लोड हो रहा है...',
    weatherNotAvailable: 'मौसम की जानकारी उपलब्ध नहीं है',
    humidity: 'नमी',
    wind: 'हवा',
    rain: 'बारिश',
    
    // Farming activities
    farmingActivities: 'कृषि गतिविधियां',
    fieldPreparation: 'खेत की तैयारी',
    sowingSeason: 'बुआई का समय',
    cropCare: 'फसल की देखभाल',
    harvestTime: 'कटाई का समय',
    
    // Quick services
    quickServices: 'त्वरित सेवाएं',
    cropDisease: 'फसल रोग',
    weather: 'मौसम',
    wallet: 'वॉलेट',
    
    // Tips
    todaysTips: 'आज के सुझाव',
    irrigationTip: 'आज का मौसम सिंचाई के लिए उपयुक्त है। सुबह या शाम के समय पानी दें।',
    priceTip: 'गेहूं की कीमत में वृद्धि हो रही है। बेचने का अच्छा समय है।',
    
    // Language selector
    selectLanguage: 'भाषा चुनें',
    
    // Additional keys
     welcome: 'नमस्ते',
      farmer: 'किसान',
      retailer: 'व्यापारी',
      todayFarming: 'आज आपकी खेती कैसी चल रही है?',
      weatherInfo: 'मौसम की जानकारी',
      todayWeather: 'आज का मौसम / Today\'s Weather',
      todayTips: 'आज के सुझाव / Today\'s Tips',
      cropAdvice: 'फसल की सलाह',
      todayRecommendations: 'आज की सिफारिशें',
      marketPrices: 'बाजार भाव',
      todayPrices: 'आज की कीमतें',
      aiAssistant: 'AI सहायक',
      getInstantHelp: 'तुरंत मदद पाएं',
      loadingWeather: 'मौसम लोड हो रहा है...',
      wheatPriceTip: 'गेहूं की कीमत में वृद्धि हो रही है। बेचने का अच्छा समय है।',
      home: 'घर',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      language: 'भाषा',
      quickActions: 'त्वरित कार्य',
      weatherUpdate: 'मौसम अपडेट',
      market: 'बाजार'
  },
  english: {
    // Welcome messages
    welcomeFarmer: 'Welcome Farmer',
    welcomeRetailer: 'Welcome Retailer',
    welcomeFarmerEng: 'Welcome Farmer',
    welcomeRetailerEng: 'Welcome Retailer',
    user: 'User',
    
    // Weather section
    todaysWeather: "Today's Weather",
    weatherLoading: 'Loading weather...',
    weatherNotAvailable: 'Weather information not available',
    humidity: 'Humidity',
    wind: 'Wind',
    rain: 'Rain',
    
    // Farming activities
    farmingActivities: 'Farming Activities',
    fieldPreparation: 'Field Preparation',
    sowingSeason: 'Sowing Season',
    cropCare: 'Crop Care',
    harvestTime: 'Harvest Time',
    
    // Quick services
    quickServices: 'Quick Services',
    cropDisease: 'Crop Disease',
    weather: 'Weather',
    wallet: 'Wallet',
    
    // Tips
    todaysTips: "Today's Tips",
    irrigationTip: "Today's weather is suitable for irrigation. Water in morning or evening.",
    priceTip: 'Wheat prices are increasing. Good time to sell.',
    
    // Language selector
    selectLanguage: 'Select Language',
    
    // Additional keys
     welcome: 'Welcome',
      farmer: 'Farmer',
      retailer: 'Retailer',
      todayFarming: 'How is your farming going today?',
      weatherInfo: 'Weather Information',
      todayWeather: 'Today\'s Weather',
      todayTips: 'Today\'s Tips',
      cropAdvice: 'Crop Advice',
      todayRecommendations: 'Today\'s Recommendations',
      marketPrices: 'Market Prices',
      todayPrices: 'Today\'s Prices',
      aiAssistant: 'AI Assistant',
      getInstantHelp: 'Get Instant Help',
      loadingWeather: 'Loading weather...',
      wheatPriceTip: 'Wheat prices are increasing. Good time to sell.',
      home: 'Home',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      language: 'Language',
      quickActions: 'Quick Actions',
      weatherUpdate: 'Weather Update',
      market: 'Marketplace'
  },
  malayalam: {
    // Welcome messages
    welcomeFarmer: 'സ്വാഗതം കർഷകരേ',
    welcomeRetailer: 'സ്വാഗതം വ്യാപാരിയേ',
    welcomeFarmerEng: 'Welcome Farmer',
    welcomeRetailerEng: 'Welcome Retailer',
    user: 'ഉപയോക്താവ്',
    
    // Weather section
    todaysWeather: 'ഇന്നത്തെ കാലാവസ്ഥ',
    weatherLoading: 'കാലാവസ്ഥ ലോഡ് ചെയ്യുന്നു...',
    weatherNotAvailable: 'കാലാവസ്ഥാ വിവരങ്ങൾ ലഭ്യമല്ല',
    humidity: 'ആർദ്രത',
    wind: 'കാറ്റ്',
    rain: 'മഴ',
    
    // Farming activities
    farmingActivities: 'കാർഷിക പ്രവർത്തനങ്ങൾ',
    fieldPreparation: 'വയൽ തയ്യാറാക്കൽ',
    sowingSeason: 'വിതയ്ക്കൽ സമയം',
    cropCare: 'വിള പരിചരണം',
    harvestTime: 'വിളവെടുപ്പ് സമയം',
    
    // Quick services
    quickServices: 'ദ്രുത സേവനങ്ങൾ',
    cropDisease: 'വിള രോഗം',
    weather: 'കാലാവസ്ഥ',
    wallet: 'വാലറ്റ്',
    
    // Tips
    todaysTips: 'ഇന്നത്തെ നുറുങ്ങുകൾ',
    irrigationTip: 'ഇന്നത്തെ കാലാവസ്ഥ നനയ്ക്കാൻ അനുയോജ്യമാണ്. രാവിലെയോ വൈകുന്നേരമോ വെള്ളം നൽകുക.',
    priceTip: 'ഗോതമ്പിന്റെ വില വർദ്ധിച്ചുകൊണ്ടിരിക്കുന്നു. വിൽക്കാൻ നല്ല സമയം.',
    
    // Language selector
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    
    // Additional keys
     welcome: 'സ്വാഗതം',
      farmer: 'കർഷകൻ',
      retailer: 'വ്യാപാരി',
      todayFarming: 'ഇന്ന് നിങ്ങളുടെ കൃഷി എങ്ങനെ പോകുന്നു?',
      weatherInfo: 'കാലാവസ്ഥാ വിവരങ്ങൾ',
      todayWeather: 'ഇന്നത്തെ കാലാവസ്ഥ',
      todayTips: 'ഇന്നത്തെ നുറുങ്ങുകൾ',
      cropAdvice: 'വിള ഉപദേശം',
      todayRecommendations: 'ഇന്നത്തെ ശുപാർശകൾ',
      marketPrices: 'വിപണി വിലകൾ',
      todayPrices: 'ഇന്നത്തെ വിലകൾ',
      aiAssistant: 'AI സഹായി',
      getInstantHelp: 'തൽക്ഷണ സഹായം നേടുക',
      loadingWeather: 'കാലാവസ്ഥ ലോഡ് ചെയ്യുന്നു...',
      wheatPriceTip: 'ഗോതമ്പിന്റെ വില വർദ്ധിച്ചുകൊണ്ടിരിക്കുന്നു. വിൽക്കാൻ നല്ല സമയം.',
      home: 'ഹോം',
      profile: 'പ്രൊഫൈൽ',
      settings: 'ക്രമീകരണങ്ങൾ',
      logout: 'ലോഗൗട്ട്',
      language: 'ഭാഷ',
      quickActions: 'ദ്രുത പ്രവർത്തനങ്ങൾ',
      weatherUpdate: 'കാലാവസ്ഥാ അപ്ഡേറ്റ്',
      market: 'മാർക്കറ്റ്'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('hindi');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && ['hindi', 'english', 'malayalam'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};