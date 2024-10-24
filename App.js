import React, { useContext } from "react";
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
import { View, Button, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import AddCryptoScreen from "./src/screens/AddCryptoScreen";
import BitcoinScreen from "./src/screens/currency/BitcoinScreen";
import WalletDetailScreen from "./src/screens/WalletDetailScreen";
import BananoScreen from "./src/screens/currency/BananoScreen";
import StellarScreen from "./src/screens/currency/StellarScreen";
import { ThemeProvider, ThemeContext } from "./src/utils/ThemeContext";
const Stack = createStackNavigator();

function AppNavigator() {
  const { isDarkMode } = useContext(ThemeContext);

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
            title: "Home", // Centered Title
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
        <Stack.Screen name="ShowDetail" component={WalletDetailScreen} />
        <Stack.Screen name="Bitcoin" component={BitcoinScreen} />
        <Stack.Screen name="Solana" component={SolScreen} />
        <Stack.Screen name="Banano" component={BananoScreen} />
        <Stack.Screen name="Stellar" component={StellarScreen} />
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
