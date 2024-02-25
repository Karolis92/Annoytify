import { config } from "@tamagui/config/v2";
import { PropsWithChildren } from "react";
import { TamaguiProvider, createTamagui } from "tamagui";
import ThemedStatusBar from "./ThemedStatusBar";

const tamaguiConfig = createTamagui(config);

// this makes typescript properly type everything based on the config
type Conf = typeof tamaguiConfig;
declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

const AppThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ThemedStatusBar />
      {children}
    </TamaguiProvider>
  );
};

export default AppThemeProvider;
