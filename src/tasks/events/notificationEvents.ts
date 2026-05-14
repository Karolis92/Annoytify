import {
  NotificationEvent,
  registerNotificationEventTask,
} from "../../../modules/notifications";
import { PressAction } from "../../common/enums/PressAction";
import notificationsService from "../services/notificationsService";
import { getTasksService } from "../services/tasksService";

export const registerNotificationEventHandler = () => {
  registerNotificationEventTask(
    async ({ type, notification, pressAction }: NotificationEvent) => {
      switch (type) {
        case "dismissed":
          console.log("Notification event: User dismissed notification");
          if (notification?.android?.ongoing) {
            await notificationsService.displayNotification(notification);
          }
          break;
        case "actionPress":
          console.log("Notification event: User pressed notification's action");
          if (notification?.id && pressAction?.id === PressAction.Done) {
            const tasksService = await getTasksService();
            await tasksService.changeStateById(notification.id);
          }
          break;
      }
    },
  );
};
