// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider } from "providers";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider as ReduxProvider } from "react-redux";
import store from "store";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent auto-hide so we can control it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    // Add other fonts here if needed
  });

  // Hide splash when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Optionally return null to hold UI while loading
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ReduxProvider store={store}>
        <AuthProvider>
          <Slot /> {/* Will render (auth)/ or (tabs)/ routes */}
          <Toast />
        </AuthProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
