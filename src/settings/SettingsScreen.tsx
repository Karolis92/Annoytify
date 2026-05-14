import { useEffect, useState } from "react";
import { Button, Text, View, XStack, YStack } from "tamagui";
import notificationsService from "../tasks/services/notificationsService";
import { getTasksService } from "../tasks/services/tasksService";

interface PermissionState {
  notifications: boolean;
  exactAlarms: boolean;
}

const SettingsScreen = () => {
  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);

  const refreshPermissionState = async () => {
    const [notifications, exactAlarms] = await Promise.all([
      notificationsService.checkPermission(),
      notificationsService.canScheduleExactAlarms(),
    ]);
    setPermissionState({ notifications, exactAlarms });

    if (notifications && exactAlarms) {
      const tasksService = await getTasksService();
      await tasksService.restoreNotifications();
    }
  };

  useEffect(() => {
    void refreshPermissionState();
  }, []);

  const requestNotifications = async () => {
    await notificationsService.requestPermission();
    await refreshPermissionState();
  };

  const openExactAlarmSettings = async () => {
    await notificationsService.openExactAlarmSettings();
  };

  return (
    <YStack padding="$3" gap="$4">
      <PermissionRow
        label="Notifications"
        granted={permissionState?.notifications}
        actionLabel="Allow"
        onPress={requestNotifications}
      />
      <PermissionRow
        label="Exact alarms"
        granted={permissionState?.exactAlarms}
        actionLabel="Open settings"
        onPress={openExactAlarmSettings}
      />
      <Button onPress={refreshPermissionState}>Refresh status</Button>
    </YStack>
  );
};

interface PermissionRowProps {
  label: string;
  granted?: boolean;
  actionLabel: string;
  onPress: () => void;
}

const PermissionRow = ({
  label,
  granted,
  actionLabel,
  onPress,
}: PermissionRowProps) => (
  <XStack alignItems="center" justifyContent="space-between" gap="$3">
    <View flex={1}>
      <Text fontWeight="600">{label}</Text>
      <Text color="$color10">{granted ? "Allowed" : "Needs permission"}</Text>
    </View>
    {!granted && <Button onPress={onPress}>{actionLabel}</Button>}
  </XStack>
);

export default SettingsScreen;
