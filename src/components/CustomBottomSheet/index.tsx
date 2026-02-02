import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  FlatListProps,
  Keyboard,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

export type CustomBottomSheetRef = {
  expand: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number) => void;
};

type CustomBottomSheetProps = {
  children: React.ReactNode;
  snapPoints: (string | number)[];
  index?: number;
  enablePanDownToClose?: boolean;
  onClose?: () => void;
  onChange?: (index: number) => void;
  handleIndicatorStyle?: StyleProp<ViewStyle>;
  backgroundStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardBehavior?: "interactive" | "extend" | "fillParent";
  keyboardBlurBehavior?: "none" | "restore";
  backdropComponent?: React.ComponentType<CustomBottomSheetBackdropProps>;
  animateOnMount?: boolean;
};

// ============================================================================
// Context
// ============================================================================

type BottomSheetContextType = {
  scrollEnabled: boolean;
  setScrollEnabled: (enabled: boolean) => void;
};

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

const useBottomSheetContext = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error(
      "BottomSheet components must be used within a CustomBottomSheet"
    );
  }
  return context;
};

// ============================================================================
// Utility Functions
// ============================================================================

const parseSnapPoint = (
  snapPoint: string | number,
  containerHeight: number
): number => {
  if (typeof snapPoint === "number") {
    return snapPoint;
  }
  if (snapPoint.endsWith("%")) {
    const percentage = parseFloat(snapPoint) / 100;
    return containerHeight * percentage;
  }
  return parseFloat(snapPoint);
};

const SPRING_CONFIG = {
  damping: 50,
  stiffness: 500,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

// ============================================================================
// Main Component: CustomBottomSheet
// ============================================================================

const CustomBottomSheet = forwardRef<
  CustomBottomSheetRef,
  CustomBottomSheetProps
>(
  (
    {
      children,
      snapPoints: snapPointsProp,
      index = 0,
      enablePanDownToClose = true,
      onClose,
      onChange,
      handleIndicatorStyle,
      backgroundStyle,
      handleStyle,
      style,
      keyboardBlurBehavior = "restore",
      backdropComponent: BackdropComponent,
      animateOnMount = true,
    },
    ref
  ) => {
    const [scrollEnabled, setScrollEnabled] = useState(true);

    // Parse snap points to pixel values (using SCREEN_HEIGHT, not shared value)
    const snapPoints = useMemo(() => {
      return snapPointsProp.map((sp) => parseSnapPoint(sp, SCREEN_HEIGHT));
    }, [snapPointsProp]);

    // Convert snap point heights to translateY positions (from bottom)
    const snapPositions = useMemo(() => {
      return snapPoints.map((height) => SCREEN_HEIGHT - height);
    }, [snapPoints]);

    // Closed position (fully hidden below screen)
    const closedPosition = SCREEN_HEIGHT;

    // Initial position
    const initialPosition = animateOnMount
      ? closedPosition
      : (snapPositions[index] ?? closedPosition);

    // Current position (translateY)
    const translateY = useSharedValue(initialPosition);

    // Track current snap index
    const currentIndex = useSharedValue(index);

    // Store gesture start position
    const startY = useSharedValue(0);

    // Store snap positions in shared value for worklet access
    const snapPositionsShared = useSharedValue(snapPositions);

    // Update shared snap positions when they change
    useEffect(() => {
      snapPositionsShared.value = snapPositions;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snapPositions]);

    // Animate to initial position on mount
    useEffect(() => {
      if (animateOnMount && snapPositions[index] !== undefined) {
        translateY.value = withSpring(snapPositions[index], SPRING_CONFIG);
        currentIndex.value = index;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Callbacks for worklet
    const handleClose = () => {
      onClose?.();
    };

    const handleChange = (idx: number) => {
      onChange?.(idx);
    };

    const dismissKeyboard = () => {
      Keyboard.dismiss();
    };

    // Pan gesture
    const panGesture = Gesture.Pan()
      .onStart(() => {
        startY.value = translateY.value;
        if (keyboardBlurBehavior === "restore") {
          runOnJS(dismissKeyboard)();
        }
      })
      .onUpdate((event) => {
        const positions = snapPositionsShared.value;
        const newY = startY.value + event.translationY;

        // Limit upward movement to highest snap point
        const minY = positions[positions.length - 1];
        const maxY = enablePanDownToClose ? closedPosition : positions[0];

        translateY.value = Math.max(minY, Math.min(maxY, newY));
      })
      .onEnd((event) => {
        const positions = snapPositionsShared.value;
        const currentY = translateY.value;
        const velocity = event.velocityY;

        // Find nearest snap point
        let nearestIndex = 0;
        let minDistance = Math.abs(currentY - positions[0]);

        for (let i = 1; i < positions.length; i++) {
          const distance = Math.abs(currentY - positions[i]);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
          }
        }

        // Adjust based on velocity
        if (Math.abs(velocity) > 500) {
          if (velocity > 0) {
            // Swiping down - go to smaller snap point (higher Y value)
            nearestIndex = Math.max(0, nearestIndex - 1);
          } else {
            // Swiping up - go to larger snap point (lower Y value)
            nearestIndex = Math.min(positions.length - 1, nearestIndex + 1);
          }
        }

        // Check if should close
        if (enablePanDownToClose && velocity > 500 && currentY > positions[0]) {
          translateY.value = withSpring(closedPosition, SPRING_CONFIG);
          currentIndex.value = -1;
          runOnJS(handleClose)();
          return;
        }

        translateY.value = withSpring(positions[nearestIndex], SPRING_CONFIG);
        currentIndex.value = nearestIndex;
        runOnJS(handleChange)(nearestIndex);
      });

    // Imperative handle
    useImperativeHandle(ref, () => ({
      expand: () => {
        const highestSnapPosition = snapPositions[snapPositions.length - 1];
        translateY.value = withSpring(highestSnapPosition, SPRING_CONFIG);
        currentIndex.value = snapPositions.length - 1;
        onChange?.(snapPositions.length - 1);
      },
      close: () => {
        translateY.value = withSpring(closedPosition, SPRING_CONFIG);
        currentIndex.value = -1;
        onClose?.();
      },
      snapToIndex: (idx: number) => {
        if (idx >= 0 && idx < snapPositions.length) {
          translateY.value = withSpring(snapPositions[idx], SPRING_CONFIG);
          currentIndex.value = idx;
          onChange?.(idx);
        } else if (idx === -1) {
          translateY.value = withSpring(closedPosition, SPRING_CONFIG);
          currentIndex.value = -1;
          onClose?.();
        }
      },
      snapToPosition: (position: number) => {
        translateY.value = withSpring(
          SCREEN_HEIGHT - position,
          SPRING_CONFIG
        );
      },
    }));

    // Animated style
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    // Context value
    const contextValue = useMemo(
      () => ({
        scrollEnabled,
        setScrollEnabled,
      }),
      [scrollEnabled]
    );

    return (
      <BottomSheetContext.Provider value={contextValue}>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Backdrop */}
          {BackdropComponent && (
            <BackdropComponent
              animatedIndex={currentIndex}
              animatedPosition={translateY}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Bottom Sheet */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.container,
                backgroundStyle,
                style,
                animatedStyle,
              ]}
            >
              {/* Handle */}
              <View style={[styles.handleContainer, handleStyle]}>
                <View style={[styles.handle, handleIndicatorStyle]} />
              </View>

              {/* Content */}
              {children}
            </Animated.View>
          </GestureDetector>
        </View>
      </BottomSheetContext.Provider>
    );
  }
);

CustomBottomSheet.displayName = "CustomBottomSheet";

// ============================================================================
// Sub-Components
// ============================================================================

// CustomBottomSheetView
export const CustomBottomSheetView: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style }) => {
  return <View style={[styles.contentContainer, style]}>{children}</View>;
};

// CustomBottomSheetFlatList
type CustomBottomSheetFlatListProps<T> = Omit<FlatListProps<T>, "scrollEnabled">;

export function CustomBottomSheetFlatList<T>(
  props: CustomBottomSheetFlatListProps<T>
) {
  const { scrollEnabled } = useBottomSheetContext();
  const flatListRef = useRef<FlatList<T>>(null);

  return (
    <FlatList
      ref={flatListRef}
      {...props}
      scrollEnabled={scrollEnabled}
      bounces={false}
      overScrollMode="never"
    />
  );
}

// CustomBottomSheetBackdrop
export type CustomBottomSheetBackdropProps = {
  animatedIndex: Animated.SharedValue<number>;
  animatedPosition: Animated.SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  appearsOnIndex?: number;
  disappearsOnIndex?: number;
  pressBehavior?: "none" | "close" | "collapse";
  onPress?: () => void;
  opacity?: number;
};

export const CustomBottomSheetBackdrop: React.FC<
  CustomBottomSheetBackdropProps
> = ({
  animatedIndex,
  style,
  appearsOnIndex = 0,
  pressBehavior = "close",
  onPress,
  opacity = 0.5,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isVisible = animatedIndex.value >= appearsOnIndex;
    return {
      opacity: withTiming(isVisible ? opacity : 0, { duration: 200 }),
    };
  });

  const handlePress = () => {
    if (pressBehavior === "none") return;
    onPress?.();
  };

  return (
    <Animated.View
      style={[styles.backdrop, style, animatedStyle]}
      pointerEvents={pressBehavior === "none" ? "none" : "box-none"}
    >
      {pressBehavior !== "none" && (
        <Pressable style={StyleSheet.absoluteFill} onPress={handlePress} />
      )}
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
  },
  contentContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
});

// ============================================================================
// Exports
// ============================================================================

export default CustomBottomSheet;
export { CustomBottomSheet };
