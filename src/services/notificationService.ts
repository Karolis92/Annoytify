import notifee, {
  Event,
  EventType,
  Notification,
  Trigger,
} from "@notifee/react-native";
import { NotificationChannels } from "../enum/NotificationChannels";
import { PressAction } from "../enum/PressAction";

class NotificationService {
  constructor() {
    this.listenBackgroundEvents();
    this.setupNotificationChannels();
  }

  setupNotificationChannels() {
    notifee.createChannel({
      id: NotificationChannels.Reminders,
      name: "Reminders",
    });
  }

  listenBackgroundEvents() {
    return notifee.onBackgroundEvent(this.eventListener);
  }

  listenForegroundEvents() {
    return notifee.onForegroundEvent(this.eventListener);
  }

  requestPermission() {
    return notifee.requestPermission();
  }

  displayNotification(notification: Notification) {
    return notifee.displayNotification(notification);
  }

  createTriggerNotification(notification: Notification, trigger: Trigger) {
    return notifee.createTriggerNotification(notification, trigger);
  }

  private async eventListener({ type, detail }: Event) {
    switch (type) {
      case EventType.DISMISSED:
        console.log("User dismissed notification", detail.notification?.id);
        if (detail.notification?.android?.ongoing) {
          notifee.displayNotification(detail.notification);
        }
        break;
      case EventType.PRESS:
        console.log(
          "User pressed notification",
          detail.notification?.id,
          detail.pressAction?.id
        );
        break;
      case EventType.ACTION_PRESS:
        console.log(
          "User pressed notification",
          detail.notification?.id,
          detail.pressAction?.id
        );
        if (
          detail.notification?.id &&
          detail.pressAction?.id === PressAction.Done
        ) {
          notifee.cancelNotification(detail.notification?.id);
        }
        break;
    }
  }
}

export const notificationService = new NotificationService();
