import "react-native-get-random-values";
import RootNavigator from "./src/navigation/RootNavigator";
import NotificationPermissionGate from "./src/notifications/NotificationPermissionGate";
import { registerOnBootListener } from "./src/tasks/events/bootEvents";
import { registerNotificationEventsListener } from "./src/tasks/events/notificationEvents";
import AppThemeProvider from "./src/theme/AppTheme";

registerOnBootListener();
registerNotificationEventsListener();

export default function App() {
  return (
    <AppThemeProvider>
      <NotificationPermissionGate>
        <RootNavigator />
      </NotificationPermissionGate>
    </AppThemeProvider>
  );
}
