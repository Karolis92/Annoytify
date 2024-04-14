import notifee, {
  Event,
  EventType,
  Notification,
  TriggerType,
} from "@notifee/react-native";
import { registerOnBootTask } from "../../../modules/on-boot";
import { NotificationChannels } from "../../common/enums/NotificationChannels";
import { PressAction } from "../../common/enums/PressAction";
import { Task } from "../db/models";
import tasksService from "./tasksService";

class NotificationsService {
  constructor() {
    this.setupNotificationChannels();
    this.listenBackgroundEvents();
    this.registerBootTask();
    notifee.requestPermission();
  }

  private setupNotificationChannels() {
    notifee.createChannel({
      id: NotificationChannels.Reminders,
      name: "Reminders",
    });
  }

  private listenBackgroundEvents() {
    return notifee.onBackgroundEvent(this.onNotificationEvent);
  }

  private registerBootTask() {
    registerOnBootTask(() => this.showOngoingNotification());
  }

  private async showOngoingNotification() {
    const ongoingTasks = tasksService.getOngoingTasks();
    ongoingTasks.forEach((task) =>
      notifee.displayNotification(this.createNotification(task))
    );
  }

  private createNotification(task: Task): Notification {
    return {
      id: task._id.toString(),
      title: task.title,
      body: task.description,
      android: {
        channelId: NotificationChannels.Reminders,
        ongoing: true,
        autoCancel: false,
        pressAction: { id: PressAction.Default },
        actions: [
          {
            title: "Done",
            pressAction: {
              id: PressAction.Done,
            },
          },
        ],
      },
    };
  }

  private async onNotificationEvent({ type, detail }: Event) {
    switch (type) {
      case EventType.DISMISSED:
        console.log("User dismissed notification");
        if (detail.notification?.android?.ongoing) {
          notifee.displayNotification(detail.notification);
        }
        break;
      case EventType.PRESS:
        console.log("User pressed notification");
        break;
      case EventType.ACTION_PRESS:
        console.log("User pressed notification's action");
        if (
          detail.notification?.id &&
          detail.pressAction?.id === PressAction.Done
        ) {
          tasksService.markDone(detail.notification.id);
          notifee.cancelNotification(detail.notification?.id);
        }
        break;
    }
  }

  listenForegroundEvents() {
    return notifee.onForegroundEvent(this.onNotificationEvent);
  }

  scheduleNotification(task: Task) {
    return notifee.createTriggerNotification(this.createNotification(task), {
      type: TriggerType.TIMESTAMP,
      timestamp: Math.max(task.date.getTime(), Date.now() + 1000),
    });
  }
}

export default new NotificationsService();
