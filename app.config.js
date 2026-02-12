export default {
  expo: {
    name: "Yes Exchange",
    slug: "yesexchangeexpo",
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/images/iconorange.png",
    scheme: "yesexchangeexpo",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      buildNumber: "34",
      bundleIdentifier: "com.mosiva.yesexchangeexpo",
      googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Ваше местоположение нужно, чтобы показать ближайшие филиалы обмена валют.",
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["remote-notification"],
      },
    },

    android: {
      package: "com.mosiva.yesexchangeexpo",
      versionCode: 34,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#F79633",
      },
      softwareKeyboardLayoutMode: "pan",
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/adaptive-icon.png",
    },

    plugins: [
      "expo-router",
      "expo-notifications",
      "@react-native-firebase/app",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 150,
          resizeMode: "contain",
          backgroundColor: "#F79633",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Приложению нужен доступ к вашей геолокации для определения ближайших филиалов.",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          }
        }
      ]
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      eas: {
        projectId: "92dc1583-1c82-4606-a276-6b9e08596b8a",
      },
    },
  },
};
