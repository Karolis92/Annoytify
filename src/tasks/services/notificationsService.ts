import notifee, {
  Event,
  Notification,
  TriggerType,
} from "@notifee/react-native";
import { NotificationChannels } from "../../common/enums/NotificationChannels";

class NotificationsService {
  private channelPromise: Promise<string>;

  constructor() {
    this.channelPromise = notifee.createChannel({
      id: NotificationChannels.Reminders,
      name: "Reminders",
    });
  }

  async requestPermission() {
    await this.channelPromise;
    await notifee.requestPermission();
  }

  async displayNotification(notification: Notification) {
    await this.channelPromise;
    return notifee.displayNotification(notification);
  }

  async scheduleNotification(notification: Notification, time: Date) {
    await this.channelPromise;
    return notifee.createTriggerNotification(notification, {
      type: TriggerType.TIMESTAMP,
      timestamp: Math.max(time.getTime(), Date.now() + 1000),
    });
  }

  cancelNotification(id: string) {
    return notifee.cancelNotification(id);
  }

  onBackgroundEvent(observer: (event: Event) => Promise<void>) {
    return notifee.onBackgroundEvent(observer);
  }

  onForegroundEvent(observer: (event: Event) => Promise<void>) {
    return notifee.onForegroundEvent(observer);
  }
}

export default new NotificationsService();
