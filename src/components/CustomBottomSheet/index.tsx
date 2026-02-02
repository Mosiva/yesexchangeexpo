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
  Animated,
  Dimensions,
  FlatList,
  FlatListProps,
  Keyboard,
  PanResponder,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

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
    const [currentSnapIndex, setCurrentSnapIndex] = useState(index);

    // Parse snap points to pixel values
    const snapPoints = useMemo(() => {
      return snapPointsProp.map((sp) => parseSnapPoint(sp, SCREEN_HEIGHT));
    }, [snapPointsProp]);

    // Convert snap point heights to translateY positions (from bottom)
    const snapPositions = useMemo(() => {
      return snapPoints.map((height) => SCREEN_HEIGHT - height);
    }, [snapPoints]);

    // Closed position
    const closedPosition = SCREEN_HEIGHT;

    // Animated value for translateY
    const translateY = useRef(
      new Animated.Value(
        animateOnMount ? closedPosition : (snapPositions[index] ?? closedPosition)
      )
    ).current;

    // Store current position for pan gesture
    const lastPosition = useRef(
      animateOnMount ? closedPosition : (snapPositions[index] ?? closedPosition)
    );

    // Animate to position
    const animateToPosition = (position: number, callback?: () => void) => {
      Animated.spring(translateY, {
        toValue: position,
        damping: 50,
        stiffness: 500,
        mass: 1,
        useNativeDriver: true,
      }).start(() => {
        lastPosition.current = position;
        callback?.();
      });
    };

    // Find nearest snap point
    const findNearestSnapIndex = (currentY: number, velocity: number): number => {
      let nearestIndex = 0;
      let minDistance = Math.abs(currentY - snapPositions[0]);

      for (let i = 1; i < snapPositions.length; i++) {
        const distance = Math.abs(currentY - snapPositions[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      // Adjust based on velocity
      if (Math.abs(velocity) > 0.5) {
        if (velocity > 0) {
          nearestIndex = Math.max(0, nearestIndex - 1);
        } else {
          nearestIndex = Math.min(snapPositions.length - 1, nearestIndex + 1);
        }
      }

      return nearestIndex;
    };

    // Pan responder for handle
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          if (keyboardBlurBehavior === "restore") {
            Keyboard.dismiss();
          }
        },
        onPanResponderMove: (_, gestureState) => {
          const newY = lastPosition.current + gestureState.dy;
          const minY = snapPositions[snapPositions.length - 1];
          const maxY = enablePanDownToClose ? closedPosition : snapPositions[0];
          const clampedY = Math.max(minY, Math.min(maxY, newY));
          translateY.setValue(clampedY);
        },
        onPanResponderRelease: (_, gestureState) => {
          const currentY = lastPosition.current + gestureState.dy;
          const velocity = gestureState.vy;

          // Check if should close
          if (enablePanDownToClose && velocity > 0.5 && currentY > snapPositions[0]) {
            animateToPosition(closedPosition, () => {
              setCurrentSnapIndex(-1);
              onClose?.();
            });
            return;
          }

          const nearestIndex = findNearestSnapIndex(currentY, velocity);
          animateToPosition(snapPositions[nearestIndex], () => {
            setCurrentSnapIndex(nearestIndex);
            onChange?.(nearestIndex);
          });
        },
      })
    ).current;

    // Animate to initial position on mount
    useEffect(() => {
      if (animateOnMount && snapPositions[index] !== undefined) {
        setTimeout(() => {
          animateToPosition(snapPositions[index], () => {
            setCurrentSnapIndex(index);
          });
        }, 100);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Imperative handle
    useImperativeHandle(ref, () => ({
      expand: () => {
        const highestSnapPosition = snapPositions[snapPositions.length - 1];
        animateToPosition(highestSnapPosition, () => {
          setCurrentSnapIndex(snapPositions.length - 1);
          onChange?.(snapPositions.length - 1);
        });
      },
      close: () => {
        animateToPosition(closedPosition, () => {
          setCurrentSnapIndex(-1);
          onClose?.();
        });
      },
      snapToIndex: (idx: number) => {
        if (idx >= 0 && idx < snapPositions.length) {
          animateToPosition(snapPositions[idx], () => {
            setCurrentSnapIndex(idx);
            onChange?.(idx);
          });
        } else if (idx === -1) {
          animateToPosition(closedPosition, () => {
            setCurrentSnapIndex(-1);
            onClose?.();
          });
        }
      },
      snapToPosition: (position: number) => {
        animateToPosition(SCREEN_HEIGHT - position);
      },
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
              animatedIndex={currentSnapIndex}
              animatedPosition={translateY}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Bottom Sheet */}
          <Animated.View
            style={[
              styles.container,
              backgroundStyle,
              style,
              { transform: [{ translateY }] },
            ]}
          >
            {/* Handle - pan gesture area */}
            <View {...panResponder.panHandlers} style={[styles.handleContainer, handleStyle]}>
              <View style={[styles.handle, handleIndicatorStyle]} />
            </View>

            {/* Content */}
            {children}
          </Animated.View>
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
      style={[{ flex: 1 }, props.style]}
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled={true}
    />
  );
}

// CustomBottomSheetBackdrop
export type CustomBottomSheetBackdropProps = {
  animatedIndex: number;
  animatedPosition: Animated.Value;
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
  const isVisible = animatedIndex >= appearsOnIndex;

  return (
    <Animated.View
      style={[
        styles.backdrop,
        style,
        { opacity: isVisible ? opacity : 0 },
      ]}
      pointerEvents={isVisible && pressBehavior !== "none" ? "auto" : "none"}
    >
      {pressBehavior !== "none" && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
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
    justifyContent: "center",
    paddingVertical: 16,
    width: "100%",
    minHeight: 40,
  },
  handle: {
    width: 60,
    height: 5,
    borderRadius: 3,
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
