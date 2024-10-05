import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import WalletScreen from "./src/screens/WalletScreen";
import SendScreen from "./src/screens/SendScreen";
import SettingScreen from "./src/screens/SettingScreen";
import { View, Button, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import AddCryptoScreen from "./src/screens/AddCryptoScreen";

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
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
  },
});
