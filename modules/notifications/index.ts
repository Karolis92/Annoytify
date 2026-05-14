import { PermissionsAndroid, Platform } from "react-native";
import { AppRegistry } from "react-native";
import { requireNativeModule } from "expo";

export type NotificationEventType = "dismissed" | "actionPress";

export interface NotificationAction {
  id: string;
  title: string;
}

export interface Notification {
  id: string;
  title: string;
  body?: string;
  android: {
    channelId: string;
    ongoing?: boolean;
    autoCancel?: boolean;
    actions?: NotificationAction[];
  };
}

export interface NotificationEvent {
  type: NotificationEventType;
  notification?: Notification;
  pressAction?: {
    id: string;
  };
}

interface NotificationsModule {
  canScheduleExactAlarms(): Promise<boolean>;
  openExactAlarmSettings(): Promise<void>;
  displayNotification(notification: Notification): Promise<void>;
  scheduleNotification(
    notification: Notification,
    timestamp: number,
  ): Promise<boolean>;
  cancelNotification(id: string): Promise<void>;
}

const nativeModule = requireNativeModule<NotificationsModule>("Notifications");

export async function checkPermission(): Promise<boolean> {
  if (Platform.OS !== "android" || Platform.Version < 33) {
    return true;
  }

  return PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS !== "android" || Platform.Version < 33) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  const hasPermission = await checkPermission();
  if (hasPermission) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export const canScheduleExactAlarms = () =>
  nativeModule.canScheduleExactAlarms();

export const openExactAlarmSettings = () =>
  nativeModule.openExactAlarmSettings();

export const displayNotification = (notification: Notification) =>
  nativeModule.displayNotification(notification);

export const scheduleNotification = (
  notification: Notification,
  timestamp: number,
) => nativeModule.scheduleNotification(notification, timestamp);

export const cancelNotification = (id: string) =>
  nativeModule.cancelNotification(id);

export function registerNotificationEventTask(
  task: (event: NotificationEvent) => Promise<void>,
) {
  AppRegistry.registerHeadlessTask("annoytify-notification-event", () => task);
}
