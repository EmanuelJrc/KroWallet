import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-svg-charts";
import * as shape from "d3-shape";
import { Circle, G, Line } from "react-native-svg";

const StellarPriceDetail = ({ price, change, percentageChange, chartData }) => {
  return (
    <View style={styles.card}>
      <View style={styles.topContainer}>
        <Text style={styles.cardTitle}>Stellar</Text>
        <Text style={styles.subTitle}>24h Price</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>${price}</Text>
        <Text style={[styles.priceChange, change < 0 && styles.negativeText]}>
          {change < 0 ? `$${change}` : `+$${change}`}
        </Text>

        <Text
          style={[
            styles.percentageChange,
            change < 0 ? styles.negativeBackground : styles.positiveBackground,
          ]}
        >
          {change < 0 ? "" : "+"}
          {percentageChange}%
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          style={{ height: 60, width: 290 }}
          data={chartData}
          svg={{
            stroke: change < 0 ? "#ff0000" : "#00ff00",
            strokeWidth: 2,
          }}
          contentInset={{ top: 10, bottom: 10 }}
          curve={shape.curveLinear}
        >
          {/* Optional: Custom Line or Point rendering */}
        </LineChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2b2b2b",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subTitle: {
    fontSize: 14,
    color: "#888888",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  priceChange: {
    fontSize: 16,
    marginLeft: 10,
    color: "green",
  },
  percentageChange: {
    fontSize: 16,
    marginLeft: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    overflow: "hidden",
    color: "white",
  },
  positiveBackground: {
    color: "black",
    fontWeight: 600,
    backgroundColor: "#00ff00",
  },
  negativeBackground: {
    color: "black",
    fontWeight: 600,
    backgroundColor: "#ff0000",
  },
  negativeText: {
    color: "red",
  },
  chartContainer: {
    alignItems: "flex-start",
    marginTop: 10,
  },
});

export default StellarPriceDetail;
