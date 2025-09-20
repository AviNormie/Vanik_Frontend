const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure platform-specific extensions
config.resolver.platforms = ['web', 'ios', 'android', 'native'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.js'];

module.exports = withNativeWind(config, { input: "./app/globals.css" });