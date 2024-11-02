import React from "react";
import { Animated } from "react-native";

const AnimatedHeader = ({ headerBackgroundColor }) => (
  <Animated.View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 110,
      backgroundColor: headerBackgroundColor,
      zIndex: 1,
    }}
  />
);

export default AnimatedHeader;
