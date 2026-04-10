import { Event, EventType } from "@notifee/react-native";
import { useEffect } from "react";
import { PressAction } from "../../common/enums/PressAction";
import notificationsService from "../services/notificationsService";
import { getTasksService } from "../services/tasksService";

const buildObserver =
  (context: "Background" | "Foreground") =>
  async ({ type, detail }: Event) => {
    switch (type) {
      case EventType.DISMISSED:
        console.log(`${context} event: User dismissed notification`);
        if (detail.notification?.android?.ongoing) {
          await notificationsService.displayNotification(detail.notification);
        }
        break;
      case EventType.PRESS:
        console.log(`${context} event: User pressed notification`);
        break;
      case EventType.ACTION_PRESS:
        console.log(`${context} event: User pressed notification's action`);
        if (
          detail.notification?.id &&
          detail.pressAction?.id === PressAction.Done
        ) {
          const tasksService = await getTasksService();
          await tasksService.changeStateById(detail.notification.id);
        }
        break;
    }
  };

export const registerNotificationEventsListener = () => {
  // register background event listener
  notificationsService.onBackgroundEvent(buildObserver("Background"));

  // return a hook to register foreground event listener
  return {
    useNotificationEvents: () => {
      useEffect(() => {
        const unsubscribe = notificationsService.onForegroundEvent(
          buildObserver("Foreground"),
        );
        return unsubscribe;
      }, []);
    },
  };
};
