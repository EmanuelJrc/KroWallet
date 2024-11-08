import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { styles } from "../styles/nanoStyles";
import Icon from "react-native-vector-icons/Ionicons";
import { ThemeContext } from "../utils/ThemeContext";
import { Button } from "react-native-paper";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Share } from "react-native";

export default function ReceiveNano({ name, visible, onClose, address }) {
  const { height } = Dimensions.get("window");
  const { isDarkMode } = useContext(ThemeContext);

  const [modalHeight, setModalHeight] = useState(height * 0.19);
  const [isDragging, setIsDragging] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const toastAnim = useRef(new Animated.Value(100)).current;

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 7)}...${address.slice(-7)}`; // Adjust slice values as needed
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
    setShowCopyToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCopyToast(false);
    });
  };

  const shareAddress = async () => {
    try {
      await Share.share({
        message: address,
        title: "Share Nano Address",
      });
    } catch (error) {
      console.error("Error sharing address:", error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => true,
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        const draggedDistance = gestureState.dy;
        if (draggedDistance > 100) {
          Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(slideAnim, {
            toValue: modalHeight,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        slideAnim.setValue(modalHeight + gestureState.dy);
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: modalHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, modalHeight]);

  const handleHeaderPress = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose);
  };

  const handleHeaderLayout = (event) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.receiveModalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <TouchableOpacity
          style={[
            styles.receiveHeader,
            isDragging && { backgroundColor: "#444" },
          ]}
          activeOpacity={1}
          onLayout={handleHeaderLayout}
        >
          <TouchableOpacity
            onPress={handleHeaderPress}
            style={styles.receiveIconButton}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={isDarkMode ? "#FFF" : "#000"}
            />
          </TouchableOpacity>

          <Text style={styles.receiveHeaderText}>Receive {name}</Text>

          <TouchableOpacity
            onPress={handleHeaderPress}
            style={styles.iconButton}
          >
            <Icon
              name="help-circle-outline"
              size={24}
              color={isDarkMode ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Modal Content */}
        <View style={styles.receiveModalView}>
          <View style={styles.qrContainer}>
            {address ? (
              <QRCode value={address} size={200} />
            ) : (
              <Text>No address available</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={copyToClipboard}
          >
            <Text style={styles.addressText}>{address}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sendButtonView}>
          <Button
            mode="contained"
            style={styles.shareButton}
            onPress={() => {
              shareAddress();
            }}
            labelStyle={styles.shareButtonLabel}
          >
            Share Address
          </Button>
        </View>
        {/* Copy Toast */}
        {showCopyToast && (
          <Animated.View
            style={[
              styles.toastContainer,
              {
                transform: [{ translateY: toastAnim }],
              },
            ]}
          >
            <View style={styles.toastContent}>
              <Text style={styles.toastText}>Address copied</Text>
              <Text style={styles.toastAddress}>
                {" "}
                {truncateAddress(address)}
              </Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
}
