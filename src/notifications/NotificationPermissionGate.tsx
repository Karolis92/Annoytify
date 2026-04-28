import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState, InteractionManager, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Spinner, Text, View, useTheme } from "tamagui";
import notificationsService from "./services/notificationsService";

interface NotificationRequirementsStatus {
  notifications: boolean;
  exactAlarms: boolean;
}

const NotificationPermissionGate = ({ children }: PropsWithChildren) => {
  const theme = useTheme();
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationRequirementsStatus>();
  const [isChecking, setIsChecking] = useState(true);
  const autoRequestAttemptedRef = useRef(false);

  const readPermissionStatus = useCallback(async () => {
    const [notifications, exactAlarms] = await Promise.all([
      notificationsService.getPermissionStatus(),
      notificationsService.getExactAlarmPermissionStatus(),
    ]);

    return { notifications, exactAlarms };
  }, []);

  const refreshPermissionStatus = useCallback(async () => {
    setIsChecking(true);
    setPermissionStatus(await readPermissionStatus());
    setIsChecking(false);
  }, [readPermissionStatus]);

  const requestPermission = useCallback(async () => {
    setIsChecking(true);
    const notifications = await notificationsService.requestPermission();
    const exactAlarms = notifications
      ? await notificationsService.getExactAlarmPermissionStatus()
      : false;
    setPermissionStatus({ notifications, exactAlarms });
    setIsChecking(false);

    return notifications;
  }, []);

  const requestPermissionOrOpenSettings = useCallback(async () => {
    if (!permissionStatus?.notifications) {
      const granted = await requestPermission();
      if (!granted) {
        await Linking.openSettings();
      }
      return;
    }

    if (!permissionStatus.exactAlarms) {
      setIsChecking(true);
      const exactAlarms =
        await notificationsService.requestExactAlarmPermission();
      setPermissionStatus({
        notifications: true,
        exactAlarms,
      });
      setIsChecking(false);
    }
  }, [permissionStatus, requestPermission]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const status = await readPermissionStatus();
      if (!isMounted) {
        return;
      }

      setPermissionStatus(status);
      setIsChecking(false);

      if (status.notifications || autoRequestAttemptedRef.current) {
        return;
      }

      autoRequestAttemptedRef.current = true;

      InteractionManager.runAfterInteractions(() => {
        if (isMounted) {
          void requestPermission();
        }
      });
    };

    void initialize();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshPermissionStatus();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [readPermissionStatus, refreshPermissionStatus, requestPermission]);

  const hasPermission =
    permissionStatus?.notifications && permissionStatus?.exactAlarms;

  if (isChecking || permissionStatus === undefined) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background.get() }}
      >
        <View
          flex={1}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$background"
        >
          <Spinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    const needsNotifications = !permissionStatus.notifications;
    const title = needsNotifications
      ? "Notifications are required"
      : "Exact alarms are required";
    const description = needsNotifications
      ? "Annoytify depends on notifications to work. Enable notification permission to continue using the app. If Android does not show the system popup again, open settings and enable notifications there."
      : "Annoytify schedules reminders with exact alarms so recurring tasks fire on time. Allow exact alarms in Android settings to continue using the app.";
    const buttonLabel = needsNotifications
      ? "Allow notifications"
      : "Allow exact alarms";

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background.get() }}
      >
        <View
          flex={1}
          padding="$4"
          gap="$4"
          justifyContent="center"
          backgroundColor="$background"
        >
          <View gap="$3">
            <Text fontSize="$8" fontWeight="700">
              {title}
            </Text>
            <Text color="$gray11">{description}</Text>
          </View>
          <Button onPress={() => void requestPermissionOrOpenSettings()}>
            {buttonLabel}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};

export default NotificationPermissionGate;
