const APP_VARIANT = process.env.APP_VARIANT;

export default {
  name: APP_VARIANT ? `Annoytify (${APP_VARIANT})` : "Annoytify",
  slug: "annoytify",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#2B2B2B",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#2B2B2B",
    },
    package: APP_VARIANT ? `app.annoytify.${APP_VARIANT}` : "app.annoytify",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "../../node_modules/@notifee/react-native/android/libs",
          ],
        },
      },
    ],
  ],
};
