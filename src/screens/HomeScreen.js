import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
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
  Bnb: require("../../assets/bnb.png"),
  BitcoinCash: require("../../assets/bitcoin-cash.png"),
  Zcash: require("../../assets/zcash.png"),
};

const HomeScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);

  const handleCryptoPress = (crypto) => {
    navigation.navigate(`${crypto}`);
    console.log(`${crypto} pressed`);
  };

  const cryptos = [
    { name: "Nano", icon: CRYPTOCURRENCY_ICONS.Nano },
    { name: "Banano", icon: CRYPTOCURRENCY_ICONS.Banano },
    { name: "Solana", icon: CRYPTOCURRENCY_ICONS.Solana },
    { name: "Stellar", icon: CRYPTOCURRENCY_ICONS.Stellar },
    { name: "Ethereum", icon: CRYPTOCURRENCY_ICONS.Ethereum },
    { name: "BNB", icon: CRYPTOCURRENCY_ICONS.Bnb },
    { name: "Bitcoin", icon: CRYPTOCURRENCY_ICONS.Bitcoin },
    { name: "Litecoin", icon: CRYPTOCURRENCY_ICONS.Litecoin },
    { name: "Dash", icon: CRYPTOCURRENCY_ICONS.Dash },
    { name: "Dogecoin", icon: CRYPTOCURRENCY_ICONS.Dogecoin },
    { name: "BitcoinCash", icon: CRYPTOCURRENCY_ICONS.BitcoinCash },
    { name: "Zcash", icon: CRYPTOCURRENCY_ICONS.Zcash },
    { name: "XRP", icon: CRYPTOCURRENCY_ICONS.Xrp },
    { name: "Kava", icon: CRYPTOCURRENCY_ICONS.Kava },
    { name: "Cardano", icon: CRYPTOCURRENCY_ICONS.Cardano },
  ];

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
        { paddingTop: 120 },
      ]}
    >
      <ScrollView contentContainerStyle={styles.cryptoContainer}>
        {cryptos.map((crypto, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cryptoCard,
              isDarkMode ? styles.cryptoCardDark : styles.cryptoCardLight,
            ]}
            onPress={() => handleCryptoPress(crypto.name)}
          >
            <Text
              style={[
                styles.cryptoText,
                isDarkMode ? styles.darkText : styles.lightText,
              ]}
            >
              {crypto.name}
            </Text>
            <Image source={crypto.icon} style={styles.icon} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  lightContainer: {
    backgroundColor: "#ffffff",
  },
  darkContainer: {
    backgroundColor: "#333333",
  },
  lightText: {
    color: "#000000",
  },
  darkText: {
    color: "#ffffff",
  },
  cryptoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  cryptoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "45%",
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: "hidden", // Avoid clipping rounded corners
  },
  cryptoCardLight: {
    backgroundColor: "#f5f5f5",
  },
  cryptoCardDark: {
    backgroundColor: "#595959",
  },
  icon: {
    width: 40,
    height: 40,
  },
  cryptoText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1, // Ensure text doesn't overlap with the icon
  },
});

export default HomeScreen;
