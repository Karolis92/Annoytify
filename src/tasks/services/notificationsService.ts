import notifee, {
  Event,
  Notification,
  TriggerType,
} from "@notifee/react-native";
import { NotificationChannels } from "../../common/enums/NotificationChannels";

class NotificationsService {
  constructor() {
    this.setupNotificationChannels();
    notifee.requestPermission();
  }

  private setupNotificationChannels() {
    notifee.createChannel({
      id: NotificationChannels.Reminders,
      name: "Reminders",
    });
  }

  displayNotification(notification: Notification) {
    notifee.displayNotification(notification);
  }

  scheduleNotification(notification: Notification, time: Date) {
    return notifee.createTriggerNotification(notification, {
      type: TriggerType.TIMESTAMP,
      timestamp: Math.max(time.getTime(), Date.now() + 1000),
    });
  }

  cancelNotification(id: string) {
    notifee.cancelNotification(id);
  }

  onBackgroundEvent(observer: (event: Event) => Promise<void>) {
    return notifee.onBackgroundEvent(observer);
  }

  onForegroundEvent(observer: (event: Event) => Promise<void>) {
    return notifee.onForegroundEvent(observer);
  }
}

export default new NotificationsService();
