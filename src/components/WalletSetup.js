import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const WalletSetup = ({
  isDarkMode,
  importSecretKey,
  setImportSecretKey,
  importWallet,
  generateWallet,
  walletCreated,
}) => {
  return (
    !walletCreated && (
      <View style={styles.screen}>
        {/* Import Existing Wallet Section */}
        <View style={styles.cardContainer}>
          <Text style={[styles.cardHeaderText, isDarkMode && styles.darkText]}>
            Import Existing Wallet
          </Text>
          <View style={styles.importSection}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Enter Secret Key
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              multiline={true}
              placeholder="Secret Key"
              placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
              value={importSecretKey}
              onChangeText={setImportSecretKey}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Enter") {
                  importWallet(); // Trigger importWallet on "Enter"
                }
              }}
              blurOnSubmit={true}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.importButton, isDarkMode && styles.darkButton]}
              onPress={importWallet}
            >
              <Text
                style={[styles.importButtonText, isDarkMode && styles.darkText]}
              >
                Import Wallet
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create New Wallet Section */}
        <View style={styles.cardContainer}>
          <Text style={[styles.cardHeaderText, isDarkMode && styles.darkText]}>
            Create New Wallet
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, isDarkMode && styles.darkButton]}
            onPress={generateWallet}
          >
            <Text
              style={[styles.actionButtonText, isDarkMode && styles.darkText]}
            >
              Generate Stellar Wallet
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    paddingTop: 140,
    justifyContent: "center",
  },
  cardContainer: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    alignItems: "center",
    backgroundColor: "#333",
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#296fc5",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  importSection: {
    alignItems: "center",
    marginTop: 15,
    width: "100%",
  },
  label: {
    fontWeight: "500",
    fontSize: 16,
    color: "lightgray",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    width: "100%",
    height: 80,
    backgroundColor: "#f8f8f8",
  },
  importButton: {
    marginTop: 10,
    backgroundColor: "#296fc5",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  importButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WalletSetup;
