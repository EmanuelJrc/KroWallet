import React, { useContext, useRef } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import NanoScreen from "./src/screens/currency/NanoScreen";
import SolScreen from "./src/screens/currency/SolScreen";
import SettingScreen from "./src/screens/SettingScreen";
import { View, Button, StyleSheet, Animated, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import AddCryptoScreen from "./src/screens/AddCryptoScreen";
import BitcoinScreen from "./src/screens/currency/BitcoinScreen";
import WalletDetailScreen from "./src/screens/WalletDetailScreen";
import BananoScreen from "./src/screens/currency/BananoScreen";
import StellarScreen from "./src/screens/currency/StellarScreen";
import LitecoinScreen from "./src/screens/currency/LitecoinScreen";
import KavaScreen from "./src/screens/currency/KavaScreen";
import { ThemeProvider, ThemeContext } from "./src/utils/ThemeContext";
import CardanoScreen from "./src/screens/currency/CardanoScreen";
import DashScreen from "./src/screens/currency/DashScreen";
import XrpScreen from "./src/screens/currency/XrpScreen";
import EthereumScreen from "./src/screens/currency/EthereumScreen";
import DogecoinScreen from "./src/screens/currency/DogecoinScreen";
import BnbScreen from "./src/screens/currency/BnbScreen";
import BitcoinCashWallet from "./src/screens/currency/BitcoinCashScreen";
import ZCashWallet from "./src/screens/currency/ZCashScreen";
import SendNano from "./src/components/SendNano";
import QRCodeScannerScreen from "./src/screens/QRCodeScannerScreen";
const Stack = createStackNavigator();

function AppNavigator() {
  const { isDarkMode } = useContext(ThemeContext);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Define the header background color interpolation
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 100], // Adjust this range based on your header height
    outputRange: ["transparent", isDarkMode ? "#333" : "#fff"], // Change the colors as needed
    extrapolate: "clamp", // Prevents values from exceeding the defined range
  });

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: isDarkMode ? "black" : "white" },
          headerTintColor: isDarkMode ? "white" : "black",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerTitle: () => (
              <Text
                style={{
                  color: isDarkMode ? "#ffffff" : "#000000",
                  fontWeight: "bold",
                  fontSize: 26,
                }}
              >
                KroWallet
              </Text>
            ), // Centered Title
            headerShown: true,
            headerTransparent: true,
            headerStyle: {
              backgroundColor: isDarkMode ? "#333333" : "#ffffff",
            },
            headerLeft: () => (
              <Icon
                name="settings-outline"
                size={24}
                color={isDarkMode ? "white" : "black"}
                style={{ marginLeft: 15 }}
                onPress={() => {
                  navigation.navigate("Settings");
                }}
              />
            ),
            headerRight: () => (
              <Icon
                name="add-circle-outline"
                size={24}
                color={isDarkMode ? "white" : "black"}
                style={{ marginRight: 15 }}
                onPress={() => {
                  navigation.navigate("AddCrypto");
                }}
              />
            ),
          })}
        />
        <Stack.Screen name="Settings" component={SettingScreen} />
        <Stack.Screen name="AddCrypto" component={AddCryptoScreen} />
        <Stack.Screen
          name="Nano"
          component={NanoScreen}
          options={({ navigation }) => ({
            title: "Nano", // Centered Title
          })}
        />
        <Stack.Screen name="SendNano" component={SendNano} />
        <Stack.Screen name="ShowDetail" component={WalletDetailScreen} />
        <Stack.Screen name="QRCodeScanner" component={QRCodeScannerScreen} />
        <Stack.Screen name="Bitcoin" component={BitcoinScreen} />
        <Stack.Screen name="Solana" component={SolScreen} />
        <Stack.Screen name="Banano" component={BananoScreen} />
        <Stack.Screen name="Stellar" component={StellarScreen} />
        <Stack.Screen name="Litecoin" component={LitecoinScreen} />
        <Stack.Screen name="Kava" component={KavaScreen} />
        <Stack.Screen name="Cardano" component={CardanoScreen} />
        <Stack.Screen name="Dash" component={DashScreen} />
        <Stack.Screen name="XRP" component={XrpScreen} />
        <Stack.Screen name="Ethereum" component={EthereumScreen} />
        <Stack.Screen name="Dogecoin" component={DogecoinScreen} />
        <Stack.Screen name="BNB" component={BnbScreen} />
        <Stack.Screen name="BitcoinCash" component={BitcoinCashWallet} />
        <Stack.Screen name="Zcash" component={ZCashWallet} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
  },
});
