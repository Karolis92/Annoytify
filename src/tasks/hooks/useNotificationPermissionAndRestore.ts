import { useEffect } from "react";
import notificationsService from "../services/notificationsService";
import { getTasksService } from "../services/tasksService";

export const useNotificationPermissionAndRestore = () => {
  useEffect(() => {
    void (async () => {
      await notificationsService.requestPermission();
      if (await notificationsService.canScheduleExactAlarms()) {
        const tasksService = await getTasksService();
        await tasksService.restoreNotifications();
      }
    })();
  }, []);
};
