import { requireNativeModule } from "expo";
import type {
  NotificationChannel,
  NotificationRequest,
} from "./NotificationsModule.types";

export interface NotificationsModuleNative {
  setNotificationChannelsAsync(channels: NotificationChannel[]): Promise<void>;
  requestPermissionAsync(): Promise<boolean>;
  getPermissionStatusAsync(): Promise<boolean>;
  requestExactAlarmPermissionAsync(): Promise<boolean>;
  getExactAlarmPermissionStatusAsync(): Promise<boolean>;
  displayNotificationAsync(notification: NotificationRequest): Promise<void>;
  scheduleNotificationAsync(
    notification: NotificationRequest,
    timestamp: number,
  ): Promise<void>;
  cancelNotificationAsync(id: string): Promise<void>;
}

export default requireNativeModule<NotificationsModuleNative>(
  "NotificationsModule",
);
