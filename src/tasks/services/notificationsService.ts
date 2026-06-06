import {
  cancelNotification,
  canScheduleExactAlarms,
  checkNotificationsPermission,
  displayNotification,
  Notification,
  openExactAlarmSettings,
  requestNotificationsPermission,
  scheduleNotification,
} from "../../../modules/notifications";

export interface PermissionStatus {
  canPostNotifications: boolean;
  canScheduleAlarms: boolean;
}

class NotificationsService {
  async checkPermissions(): Promise<PermissionStatus> {
    const [canPostNotifications, canScheduleAlarms] = await Promise.all([
      checkNotificationsPermission(),
      canScheduleExactAlarms(),
    ]);

    return {
      canPostNotifications,
      canScheduleAlarms,
    };
  }

  async requestNotificationsPermission() {
    return requestNotificationsPermission();
  }

  openExactAlarmSettings() {
    return openExactAlarmSettings();
  }

  displayNotification(notification: Notification) {
    return displayNotification(notification);
  }

  scheduleNotification(notification: Notification, time: Date) {
    if (time <= new Date()) {
      return displayNotification(notification).then(() => true);
    }

    return scheduleNotification(
      notification,
      Math.max(time.getTime(), Date.now() + 1000),
    );
  }

  cancelNotification(id: string) {
    return cancelNotification(id);
  }
}

export default new NotificationsService();
