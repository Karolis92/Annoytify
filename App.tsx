import "react-native-get-random-values";
import AppRealmProvider from "./src/common/db/AppRealmProvider";
import RootNavigator from "./src/navigation/RootNavigator";
import useTaskNotificationEvents from "./src/tasks/useTaskNotificationEvents";
import AppThemeProvider from "./src/theme/AppTheme";

export default function App() {
  useTaskNotificationEvents();

  return (
    <AppRealmProvider>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </AppRealmProvider>
  );
}
