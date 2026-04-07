import { createContext, useContext } from "react";
import { ThemePreference } from "../common/enums/ThemePreference";

interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedTheme: "light" | "dark";
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themePreference: ThemePreference.System,
  resolvedTheme: "dark",
  setThemePreference: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export default ThemeContext;
