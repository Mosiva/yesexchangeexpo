import React from "react";
import { Animated, StyleSheet } from "react-native";

export const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  color = "#E0E0E0",
  highlightColor = "#F0F0F0",
  style,
}: {
  width?: string;
  height?: number;
  borderRadius?: number;
  color?: string;
  highlightColor?: string;
  style?: any;
}) => {
  const animatedValue = new Animated.Value(0);

  // Looping animation for the skeleton loading effect
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Interpolating the animated value to create a gradient effect
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [color, highlightColor],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
});
