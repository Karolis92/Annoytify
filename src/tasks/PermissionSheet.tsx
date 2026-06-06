import {
  Bell,
  Check,
  Clock,
  RefreshCw,
  Settings2,
  X,
} from "@tamagui/lucide-icons-2";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Linking } from "react-native";
import { Button, H3, Spinner, Text, XStack, YStack } from "tamagui";
import type { ButtonProps } from "tamagui";
import Sheet from "../common/components/Sheet";
import PermissionChecklistItem from "./PermissionChecklistItem";
import notificationsService, {
  PermissionStatus,
} from "./services/notificationsService";
import { getTasksService } from "./services/tasksService";

interface PermissionSheetContextValue {
  manuallyOpened: boolean;
  closePermissionSheet: () => void;
  openPermissionSheet: () => void;
}

const PermissionSheetContext =
  createContext<PermissionSheetContextValue | null>(null);

export const usePermissionSheet = () => {
  const context = useContext(PermissionSheetContext);

  if (!context) {
    throw new Error("usePermissionSheet must be used within PermissionSheet");
  }

  return context;
};

interface PermissionSheetProps {
  children: ReactNode;
}

interface PermissionActionButtonProps extends Pick<
  ButtonProps,
  "alignSelf" | "disabled" | "flex" | "onPress" | "variant"
> {
  icon: ButtonProps["icon"];
  label: string;
  loading?: boolean;
}

const PermissionActionButton = ({
  icon,
  label,
  loading = false,
  ...buttonProps
}: PermissionActionButtonProps) => (
  <Button icon={loading ? <Spinner size="small" /> : icon} {...buttonProps}>
    {label}
  </Button>
);

const PermissionSheet = ({ children }: PermissionSheetProps) => {
  const [manuallyOpened, setManuallyOpened] = useState(false);

  const value = useMemo<PermissionSheetContextValue>(
    () => ({
      manuallyOpened,
      closePermissionSheet: () => setManuallyOpened(false),
      openPermissionSheet: () => setManuallyOpened(true),
    }),
    [manuallyOpened],
  );

  return (
    <PermissionSheetContext.Provider value={value}>
      {children}
      <PermissionSheetContent />
    </PermissionSheetContext.Provider>
  );
};

const PermissionSheetContent = () => {
  const { closePermissionSheet, manuallyOpened } = usePermissionSheet();
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [notificationRequestFailed, setNotificationRequestFailed] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requestingNotifications, setRequestingNotifications] = useState(false);
  const [openingExactAlarmSettings, setOpeningExactAlarmSettings] =
    useState(false);
  const [openingAppSettings, setOpeningAppSettings] = useState(false);

  const refreshStatus = useCallback(async () => {
    setRefreshing(true);
    try {
      const nextStatus = await notificationsService.checkPermissions();
      setPermissionStatus(nextStatus);

      if (nextStatus.canPostNotifications && nextStatus.canScheduleAlarms) {
        const tasksService = await getTasksService();
        if (!tasksService.hasRestoredNotifications) {
          await tasksService.restoreNotifications();
        }
        setDismissed(false);
      }

      if (nextStatus.canPostNotifications) {
        setNotificationRequestFailed(false);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshStatus();
      }
    });

    return () => subscription.remove();
  }, [refreshStatus]);

  const missingNotifications = permissionStatus?.canPostNotifications === false;
  const missingExactAlarms = permissionStatus?.canScheduleAlarms === false;
  const showGuidance =
    manuallyOpened ||
    (!dismissed && (missingNotifications || missingExactAlarms));

  const requestNotifications = async () => {
    setRequestingNotifications(true);
    try {
      const granted =
        await notificationsService.requestNotificationsPermission();
      setNotificationRequestFailed(!granted);
      await refreshStatus();
    } finally {
      setRequestingNotifications(false);
    }
  };

  const openExactAlarmSettings = async () => {
    setOpeningExactAlarmSettings(true);
    try {
      await notificationsService.openExactAlarmSettings();
    } finally {
      setOpeningExactAlarmSettings(false);
    }
  };

  const openAppSettings = async () => {
    setOpeningAppSettings(true);
    try {
      await Linking.openSettings();
    } finally {
      setOpeningAppSettings(false);
    }
  };

  const dismissGuidance = () => {
    if (missingNotifications || missingExactAlarms) {
      setDismissed(true);
    }

    closePermissionSheet();
  };

  const notificationsComplete = permissionStatus?.canPostNotifications === true;
  const exactAlarmsComplete = permissionStatus?.canScheduleAlarms === true;
  const checkingStatus = permissionStatus === null || refreshing;
  const checklistComplete = notificationsComplete && exactAlarmsComplete;

  const notificationDescription = notificationsComplete
    ? "Annoytify can display persistent task reminders."
    : checkingStatus
      ? "Checking whether Annoytify can display persistent task reminders."
      : notificationRequestFailed
        ? "Turn on notifications from Android app settings."
        : "Allow notifications so Annoytify can display persistent task reminders.";

  const exactAlarmDescription = exactAlarmsComplete
    ? "Reminders can be scheduled at the time you choose."
    : checkingStatus
      ? "Checking whether reminders can be scheduled at the time you choose."
      : "Allow exact alarms so reminders can be scheduled at the time you choose.";

  return (
    <Sheet
      open={showGuidance}
      onOpenChange={(open: boolean) => {
        if (!open) {
          dismissGuidance();
        }
      }}
    >
      <YStack padding="$4" gap="$4">
        <YStack gap="$2">
          <H3>Reminder permissions</H3>
          {checklistComplete ? (
            <Text color="$color10">
              Notifications and exact alarms are ready for persistent task
              reminders.
            </Text>
          ) : (
            <Text color="$color10">
              Annoytify uses persistent notifications and reliable alarm timing
              to keep task reminders visible until you handle them.
            </Text>
          )}
        </YStack>

        <YStack gap="$3">
          <PermissionChecklistItem
            icon={Bell}
            title="Notifications"
            description={notificationDescription}
            complete={notificationsComplete}
          >
            {!notificationsComplete && notificationRequestFailed ? (
              <PermissionActionButton
                alignSelf="flex-start"
                icon={Settings2}
                label="Open app settings"
                loading={openingAppSettings}
                variant="outlined"
                disabled={checkingStatus || openingAppSettings}
                onPress={openAppSettings}
              />
            ) : null}

            {!notificationsComplete && !notificationRequestFailed ? (
              <PermissionActionButton
                alignSelf="flex-start"
                icon={Bell}
                label="Allow notifications"
                loading={requestingNotifications}
                disabled={checkingStatus || requestingNotifications}
                onPress={requestNotifications}
              />
            ) : null}
          </PermissionChecklistItem>
          <PermissionChecklistItem
            icon={Clock}
            title="Exact alarms"
            description={exactAlarmDescription}
            complete={exactAlarmsComplete}
          >
            {!exactAlarmsComplete ? (
              <PermissionActionButton
                alignSelf="flex-start"
                icon={Clock}
                label="Open exact alarm settings"
                loading={openingExactAlarmSettings}
                variant="outlined"
                disabled={checkingStatus || openingExactAlarmSettings}
                onPress={openExactAlarmSettings}
              />
            ) : null}
          </PermissionChecklistItem>
        </YStack>

        <YStack gap="$2">
          <XStack gap="$2">
            <PermissionActionButton
              flex={1}
              icon={RefreshCw}
              label="Refresh"
              loading={refreshing}
              variant="outlined"
              disabled={refreshing}
              onPress={refreshStatus}
            />
            <Button
              flex={1}
              icon={Check}
              variant="outlined"
              disabled={!checklistComplete}
              onPress={dismissGuidance}
            >
              Done
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Sheet>
  );
};

export default PermissionSheet;
