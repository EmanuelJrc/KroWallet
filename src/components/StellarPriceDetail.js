import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-svg-charts";
import * as shape from "d3-shape";
import { Circle, G, Line } from "react-native-svg";
import { ThemeContext } from "../utils/ThemeContext";

const StellarPriceDetail = ({
  name,
  price,
  change,
  percentageChange,
  chartData,
}) => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <View style={styles.topContainer}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkTitle]}>
          {name}
        </Text>
        <Text style={[styles.subTitle, isDarkMode && styles.darkTitle]}>
          24h Price
        </Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={[styles.price, isDarkMode && styles.darkTitle]}>
          ${price}
        </Text>
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
    backgroundColor: "#d9d9d9",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  darkCard: {
    backgroundColor: "#2b2b2b",
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
    color: "black",
  },
  darkTitle: {
    color: "white",
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
    color: "black",
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
