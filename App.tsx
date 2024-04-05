import { useEffect } from "react";
import "react-native-get-random-values";
import AppRealmProvider from "./src/common/db/AppRealmProvider";
import { notificationService } from "./src/common/services/notificationService";
import RootNavigator from "./src/navigation/RootNavigator";
import AppThemeProvider from "./src/theme/AppTheme";

export default function App() {
  useEffect(() => {
    const unsubscribe = notificationService.listenForegroundEvents();
    return unsubscribe;
  }, []);

  return (
    <AppRealmProvider>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </AppRealmProvider>
  );
}
