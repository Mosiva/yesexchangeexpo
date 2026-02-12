// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider } from "providers";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider as ReduxProvider } from "react-redux";
import store from "store";
import useCachedResources from "../hooks/useCachedResources";
import { ThemeProvider } from "../providers/ThemeProvider";

export default function RootLayout() {
  const isReady = useCachedResources();

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ReduxProvider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Slot />
            </GestureHandlerRootView>
          </ThemeProvider>
          <Toast />
        </AuthProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
