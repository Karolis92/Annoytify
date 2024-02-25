import { useNotificationEventListener } from "./src/hooks/useNotificationEventListener";
import RootNavigation from "./src/navigation/RootNavigation";
import AppThemeProvider from "./src/theme/AppTheme";

export default function App() {
  useNotificationEventListener();

  return (
    <AppThemeProvider>
      <RootNavigation />
    </AppThemeProvider>
  );
}
