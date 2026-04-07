import { useObject, useRealm } from "@realm/react";
import { PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import { UpdateMode } from "realm";
import { ThemePreference } from "../common/enums/ThemePreference";
import { ISettings, SETTINGS_ID, Settings } from "../settings/db/models";
import ThemeContext from "./ThemeContext";

const ThemePreferenceProvider = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const realm = useRealm();
  const settings = useObject(Settings, SETTINGS_ID);

  const themePreference = settings?.themePreference ?? ThemePreference.System;

  const resolvedTheme: "light" | "dark" =
    themePreference === ThemePreference.Light
      ? "light"
      : themePreference === ThemePreference.Dark
        ? "dark"
        : colorScheme === "light"
          ? "light"
          : "dark";

  const setThemePreference = (preference: ThemePreference) => {
    const data: ISettings = { _id: SETTINGS_ID, themePreference: preference };
    realm.write(() => realm.create(Settings, data, UpdateMode.Modified));
  };

  return (
    <ThemeContext.Provider
      value={{ themePreference, resolvedTheme, setThemePreference }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemePreferenceProvider;
