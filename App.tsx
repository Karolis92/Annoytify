import "react-native-get-random-values";
import RootNavigator from "./src/navigation/RootNavigator";
import PermissionSheet from "./src/tasks/PermissionSheet";
import { registerOnBootHandler } from "./src/tasks/events/bootEvents";
import { registerNotificationEventHandler } from "./src/tasks/events/notificationEvents";
import AppThemeProvider from "./src/theme/AppTheme";

registerOnBootHandler();
registerNotificationEventHandler();

export default function App() {
  return (
    <AppThemeProvider>
      <PermissionSheet>
        <RootNavigator />
      </PermissionSheet>
    </AppThemeProvider>
  );
}
