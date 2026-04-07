import { config } from "@tamagui/config";
import { PropsWithChildren } from "react";
import { TamaguiProvider, createTamagui } from "tamagui";
import { useAppTheme } from "./ThemeContext";
import ThemedStatusBar from "./ThemedStatusBar";

const tamaguiConfig = createTamagui(config);

// this makes typescript properly type everything based on the config
type Conf = typeof tamaguiConfig;
declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useAppTheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={resolvedTheme}>
      <ThemedStatusBar />
      {children}
    </TamaguiProvider>
  );
};

export default AppThemeProvider;
