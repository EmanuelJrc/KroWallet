import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text style={styles.title}>Welcome to the Crypto Wallet App!</Text>
      <Button
        title="Go to Wallet"
        onPress={() => navigation.navigate("Wallet")}
      />
      <Button
        title="Go to Bitcoin"
        onPress={() => navigation.navigate("Bitcoin")}
      />
      <Button
        title="Go to Solana"
        onPress={() => navigation.navigate("Send")}
      />
      <Button title="Go to Doge" onPress={() => navigation.navigate("Doge")} />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
  },
});

export default HomeScreen;
