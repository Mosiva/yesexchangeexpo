// hooks/useCachedResources.ts
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function useCachedResources() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function loadResources() {
      try {
        // ⚡️ preload картинок (логотипы, иконки)
        await Asset.loadAsync([
          require("../assets/images/icon.png"),
          require("../assets/images/logo.png"),
          require("../assets/images/adaptive-icon.png"),
        ]);
      } catch (e) {
        console.warn("Failed to preload assets", e);
      } finally {
        if (fontsLoaded) {
          setIsReady(true);
          await SplashScreen.hideAsync();
        }
      }
    }

    loadResources();
  }, [fontsLoaded]);

  return isReady;
}
