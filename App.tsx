import { useEffect } from "react";
import RootNavigator from "./src/navigation/RootNavigator";
import { initDb } from "./src/common/db/sqlite";
import useTaskNotificationEvents from "./src/tasks/useTaskNotificationEvents";
import AppThemeProvider from "./src/theme/AppTheme";

export default function App() {
  useTaskNotificationEvents();
  useEffect(() => {
    initDb();
  }, []);

  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  );
}
