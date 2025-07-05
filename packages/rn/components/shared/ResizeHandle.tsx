import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import { MIN_DRAWER_WIDTH, MAX_DRAWER_WIDTH } from "./constants";

interface ResizeHandleProps {
  onResize: (width: number) => void;
  currentWidth: number;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  currentWidth,
}) => {
  const [startWidth, setStartWidth] = useState(currentWidth);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setStartWidth)(currentWidth);
    })
    .onUpdate((event) => {
      const newWidth = Math.max(
        MIN_DRAWER_WIDTH,
        Math.min(MAX_DRAWER_WIDTH, startWidth + event.translationX)
      );
      runOnJS(onResize)(newWidth);
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.resizeHandle}>
        <View style={styles.resizeIndicator} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  resizeHandle: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  resizeIndicator: {
    width: 2,
    height: 40,
    backgroundColor: "#007AFF",
    borderRadius: 1,
    opacity: 0.6,
  },
});

export default ResizeHandle;
