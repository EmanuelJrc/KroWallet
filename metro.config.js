const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-crypto"),
  stream: require.resolve("stream-browserify"), // Polyfill for stream module
  buffer: require.resolve("@craftzdog/react-native-buffer"),
  os: require.resolve("os-browserify/browser"),
  process: require.resolve("process/browser"),
  util: require.resolve("util/"),
  events: require.resolve("events/"), // Polyfill for events module
};

module.exports = config;
