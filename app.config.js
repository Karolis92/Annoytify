const APP_VARIANT = process.env.APP_VARIANT;

export default {
  name: APP_VARIANT ? `Anoytify (${APP_VARIANT})` : "Anoytify",
  slug: "anoytify",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: APP_VARIANT ? `app.anoytify.${APP_VARIANT}` : "app.anoytify",
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
