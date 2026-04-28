import { AppRegistry } from "react-native";
import NotificationsModule from "./src/NotificationsModule";
import {
  NotificationChannel,
  NotificationEvent,
  NotificationRequest,
} from "./src/NotificationsModule.types";

interface HeadlessNotificationTaskInput {
  eventJson?: string;
}

export function registerNotificationEventTask(
  task: (event: NotificationEvent) => Promise<void>,
) {
  AppRegistry.registerHeadlessTask(
    "annoytify-notification-event",
    () =>
      async ({ eventJson }: HeadlessNotificationTaskInput = {}) => {
        if (eventJson) {
          await task(JSON.parse(eventJson) as NotificationEvent);
        }
      },
  );
}

export function setNotificationChannelsAsync(channels: NotificationChannel[]) {
  return NotificationsModule.setNotificationChannelsAsync(channels);
}

export function requestNotificationPermissionAsync() {
  return NotificationsModule.requestPermissionAsync();
}

export function getNotificationPermissionStatusAsync() {
  return NotificationsModule.getPermissionStatusAsync();
}

export function requestExactAlarmPermissionAsync() {
  return NotificationsModule.requestExactAlarmPermissionAsync();
}

export function getExactAlarmPermissionStatusAsync() {
  return NotificationsModule.getExactAlarmPermissionStatusAsync();
}

export function displayNotificationAsync(notification: NotificationRequest) {
  return NotificationsModule.displayNotificationAsync(notification);
}

export function scheduleNotificationAsync(
  notification: NotificationRequest,
  timestamp: number,
) {
  return NotificationsModule.scheduleNotificationAsync(notification, timestamp);
}

export function cancelNotificationAsync(id: string) {
  return NotificationsModule.cancelNotificationAsync(id);
}

export * from "./src/NotificationsModule.types";
