import { Loader } from "components";
import { useRouter } from "expo-router";
import { useAuth } from "providers";
import React, { useEffect } from "react";

export default function RootIndex() {
  const router = useRouter();
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log("🚀 RootIndex: Auth state determined", { isAuthenticated, isGuest });
      if (isAuthenticated) {
        // User is authenticated (either logged in or guest), go to main screen
        console.log("✅ RootIndex: Navigating to main screen");
        router.replace("/(tabs)/(main)");
      } else {
        // User is not authenticated, go to login screen
        console.log("🔐 RootIndex: Navigating to login screen");
        router.replace("/(auth)");
      }
    }
  }, [isAuthenticated, isGuest, isLoading, router]);

  console.log("🔄 RootIndex: Showing loader while determining auth state", { isLoading, isAuthenticated, isGuest });
  // Show loader while determining authentication state
  return <Loader />;
}
