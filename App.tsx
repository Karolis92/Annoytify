import "react-native-get-random-values";
import AppRealmProvider from "./src/common/db/AppRealmProvider";
import RootNavigator from "./src/navigation/RootNavigator";
import AppThemeProvider from "./src/theme/AppTheme";
import ThemePreferenceProvider from "./src/theme/ThemePreferenceProvider";
import useTaskNotificationEvents from "./src/tasks/useTaskNotificationEvents";

export default function App() {
  useTaskNotificationEvents();

  return (
    <AppRealmProvider>
      <ThemePreferenceProvider>
        <AppThemeProvider>
          <RootNavigator />
        </AppThemeProvider>
      </ThemePreferenceProvider>
    </AppRealmProvider>
  );
}
