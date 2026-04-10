import "react-native-get-random-values";
import RootNavigator from "./src/navigation/RootNavigator";
import { registerOnBootListener } from "./src/tasks/events/bootEvents";
import { registerNotificationEventsListener } from "./src/tasks/events/notificationEvents";
import AppThemeProvider from "./src/theme/AppTheme";

registerOnBootListener();
const { useNotificationEvents } = registerNotificationEventsListener();

export default function App() {
  useNotificationEvents();

  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  );
}
