import notifee, {
  Event,
  Notification,
  TriggerType,
} from "@notifee/react-native";
import { NotificationChannels } from "../../common/enums/NotificationChannels";

class NotificationsService {
  constructor() {
    this.setup();
  }

  private async setup() {
    await notifee.createChannel({
      id: NotificationChannels.Reminders,
      name: "Reminders",
    });
    await notifee.requestPermission();
  }

  displayNotification(notification: Notification) {
    return notifee.displayNotification(notification);
  }

  scheduleNotification(notification: Notification, time: Date) {
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
