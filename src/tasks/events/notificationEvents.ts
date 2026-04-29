import { PressAction } from "../../common/enums/PressAction";
import {
  NotificationEvent,
  NotificationEventType,
  notificationsService,
  registerNotificationEventTask,
} from "../../notifications";
import { getTasksService } from "../services/tasksService";

export const registerNotificationEventsListener = () => {
  registerNotificationEventTask(
    async ({ type, notification, actionId }: NotificationEvent) => {
      switch (type) {
        case NotificationEventType.Dismissed:
          console.log(`User dismissed notification`);
          break;
        case NotificationEventType.Pressed:
          console.log(`User pressed notification`);
          break;
        case NotificationEventType.ActionPressed:
          console.log(`User pressed notification's action`);
          if (notification.id && actionId === PressAction.Done) {
            const tasksService = await getTasksService();
            await tasksService.changeStateById(notification.id);
          }
          break;
      }
    },
  );
};
