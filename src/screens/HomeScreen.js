import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text style={styles.title}>Welcome to the Crypto Wallet App!</Text>
      <Button
        title="Go to Nano Wallet"
        onPress={() => navigation.navigate("Wallet")}
      />
      <Button
        title="Go to Bitcoin Wallet"
        onPress={() => navigation.navigate("Bitcoin")}
      />
      <Button
        title="Go to Solana Wallet"
        onPress={() => navigation.navigate("Solana")}
      />
      <Button
        title="Go to Banano Wallet"
        onPress={() => navigation.navigate("Banano")}
      />
      <Button
        title="Go to Stellar Wallet"
        onPress={() => navigation.navigate("Stellar")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
  },
});

export default HomeScreen;
