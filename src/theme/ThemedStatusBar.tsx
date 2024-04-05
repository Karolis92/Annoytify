import { StatusBar } from "react-native";
import { useTheme, useThemeName } from "tamagui";

const ThemedStatusBar = () => {
  const theme = useTheme();
  const themeName = useThemeName();

  return (
    <StatusBar
      barStyle={
        themeName.startsWith("light") ? "dark-content" : "light-content"
      }
      backgroundColor={theme.background.get()}
    />
  );
};
export default ThemedStatusBar;
