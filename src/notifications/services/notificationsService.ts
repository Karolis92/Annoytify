import {
  cancelNotificationAsync,
  displayNotificationAsync,
  getExactAlarmPermissionStatusAsync,
  getNotificationPermissionStatusAsync,
  NotificationChannel,
  NotificationRequest,
  requestExactAlarmPermissionAsync,
  requestNotificationPermissionAsync,
  restorePersistedNotificationsAsync,
  scheduleNotificationAsync,
  setNotificationChannelsAsync,
} from "../../../modules/notifications";
import { NotificationChannels } from "../../common/enums/NotificationChannels";

const appNotificationChannels: NotificationChannel[] = [
  {
    id: NotificationChannels.Reminders,
    name: "Reminders",
  },
];

class NotificationsService {
  private setupPromise?: Promise<void>;

  private async setup() {
    await setNotificationChannelsAsync(appNotificationChannels);
    await restorePersistedNotificationsAsync();
  }

  private ensureSetup() {
    this.setupPromise ??= this.setup();
    return this.setupPromise;
  }

  async requestPermission() {
    await this.ensureSetup();
    return requestNotificationPermissionAsync();
  }

  async getPermissionStatus() {
    await this.ensureSetup();
    return getNotificationPermissionStatusAsync();
  }

  async requestExactAlarmPermission() {
    await this.ensureSetup();
    return requestExactAlarmPermissionAsync();
  }

  async getExactAlarmPermissionStatus() {
    await this.ensureSetup();
    return getExactAlarmPermissionStatusAsync();
  }

  async displayNotification(notification: NotificationRequest) {
    await this.ensureSetup();
    return displayNotificationAsync(notification);
  }

  async scheduleNotification(notification: NotificationRequest, time: Date) {
    await this.ensureSetup();
    return scheduleNotificationAsync(notification, time.getTime());
  }

  cancelNotification(id: string) {
    return cancelNotificationAsync(id);
  }

  async restorePersistedNotifications() {
    await this.ensureSetup();
    return restorePersistedNotificationsAsync();
  }
}

export default new NotificationsService();
