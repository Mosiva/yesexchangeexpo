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

import useCachedResources from "../hooks/useCachedResources";

export default function RootLayout() {
  const isReady = useCachedResources();

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ReduxProvider store={store}>
        <AuthProvider>
          <Slot />
          <Toast />
        </AuthProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
