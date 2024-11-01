import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../utils/ThemeContext";

// Icons (Add your own icons for each crypto)
const CRYPTOCURRENCY_ICONS = {
  Bitcoin: require("../../assets/bitcoin.png"),
  Nano: require("../../assets/nano.png"),
  Banano: require("../../assets/banano.png"),
  Solana: require("../../assets/solana.png"),
  Stellar: require("../../assets/stellar.png"),
  Litecoin: require("../../assets/litecoin.png"),
  Kava: require("../../assets/kava.png"),
  Cardano: require("../../assets/cardano.png"),
  Dash: require("../../assets/dash.png"),
  Xrp: require("../../assets/xrp.png"),
  Ethereum: require("../../assets/ethereum.png"),
  Dogecoin: require("../../assets/dogecoin.png"),
};

const HomeScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);

  const handleCryptoPress = (crypto) => {
    // This is where you'd navigate or perform actions
    navigation.navigate(`${crypto}`);
    console.log(`${crypto} pressed`);
  };

  const cryptos = [
    { name: "Bitcoin", icon: CRYPTOCURRENCY_ICONS.Bitcoin },
    { name: "Nano", icon: CRYPTOCURRENCY_ICONS.Nano },
    { name: "Banano", icon: CRYPTOCURRENCY_ICONS.Banano },
    { name: "Solana", icon: CRYPTOCURRENCY_ICONS.Solana },
    { name: "Stellar", icon: CRYPTOCURRENCY_ICONS.Stellar },
    { name: "Litecoin", icon: CRYPTOCURRENCY_ICONS.Litecoin },
    { name: "Kava", icon: CRYPTOCURRENCY_ICONS.Kava },
    { name: "Cardano", icon: CRYPTOCURRENCY_ICONS.Cardano },
    { name: "Dash", icon: CRYPTOCURRENCY_ICONS.Dash },
    { name: "Xrp", icon: CRYPTOCURRENCY_ICONS.Xrp },
    { name: "Ethereum", icon: CRYPTOCURRENCY_ICONS.Ethereum },
    { name: "Dogecoin", icon: CRYPTOCURRENCY_ICONS.Dogecoin },
  ];

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <Text
        style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}
      >
        KroWallet
      </Text>

      <View style={styles.cryptoContainer}>
        {cryptos.map((crypto, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cryptoItem,
              isDarkMode ? styles.cryptoItemDark : styles.cryptoItemLight,
            ]}
            onPress={() => handleCryptoPress(crypto.name)}
          >
            <Image source={crypto.icon} style={styles.icon} />
            <Text
              style={[
                styles.cryptoText,
                isDarkMode ? styles.darkText : styles.lightText,
              ]}
            >
              {crypto.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#333333",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  lightText: {
    color: "#000000",
  },
  darkText: {
    color: "#FFFFFF",
  },
  cryptoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
  },
  cryptoItem: {
    alignItems: "center",
    margin: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#000000",
  },
  cryptoItemLight: {
    backgroundColor: "#d9d9d9",
  },
  cryptoItemDark: {
    backgroundColor: "#595959",
  },
  icon: {
    width: 50,
    height: 50,
  },
  cryptoText: {
    marginTop: 5,
    fontSize: 16,
  },
});

export default HomeScreen;
