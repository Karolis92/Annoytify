import {
  cancelNotification,
  canScheduleExactAlarms,
  checkPermission,
  displayNotification,
  Notification,
  openExactAlarmSettings,
  requestPermission,
  scheduleNotification,
} from "../../../modules/notifications";

class NotificationsService {
  async requestPermission() {
    return requestPermission();
  }

  checkPermission() {
    return checkPermission();
  }

  canScheduleExactAlarms() {
    return canScheduleExactAlarms();
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
