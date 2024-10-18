import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import NanoScreen from "./src/screens/NanoScreen";
import SolScreen from "./src/screens/SolScreen";
import SettingScreen from "./src/screens/SettingScreen";
import { View, Button, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import AddCryptoScreen from "./src/screens/AddCryptoScreen";
import BitcoinScreen from "./src/screens/BitcoinScreen";
import WalletDetailScreen from "./src/screens/WalletDetailScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerTitleAlign: "center" }}
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
                color="black"
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
                color="black"
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
          name="Wallet"
          component={NanoScreen}
          options={({ navigation }) => ({
            title: "Nano", // Centered Title
          })}
        />
        <Stack.Screen name="ShowDetail" component={WalletDetailScreen} />
        <Stack.Screen name="Bitcoin" component={BitcoinScreen} />
        <Stack.Screen name="Solana" component={SolScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
  },
});
