import React from "react";
import {
  ScrollView,
  View,
  StatusBar,
  RefreshControl,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native";
import { styles } from "../styles/nanoStyles";

const WalletScreenLayout = ({
  balance,
  onRefresh,
  refreshing,
  title,
  children,
}) => {
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={{ flex: 1 }}
        />
      }
    >
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#1ce6eb", "#296fc5", "#3500A2"]}
        style={{ padding: 15, minHeight: 140, justifyContent: "center" }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          {balance !== null && (
            <Text style={styles.balanceText}>{balance}</Text>
          )}
          {children} {/* For buttons or additional sections */}
        </SafeAreaView>
      </LinearGradient>
    </ScrollView>
  );
};

export default WalletScreenLayout;
