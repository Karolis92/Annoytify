import "react-native-get-random-values";
import RootNavigator from "./src/navigation/RootNavigator";
import { registerOnBootHandler } from "./src/tasks/events/bootEvents";
import { registerNotificationEventHandler } from "./src/tasks/events/notificationEvents";
import { useNotificationPermissionAndRestore } from "./src/tasks/hooks/useNotificationPermissionAndRestore";
import AppThemeProvider from "./src/theme/AppTheme";

registerOnBootHandler();
registerNotificationEventHandler();

export default function App() {
  useNotificationPermissionAndRestore();

  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  );
}
