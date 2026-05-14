import { registerOnBootTask } from "../../../modules/on-boot";
import { getTasksService } from "../services/tasksService";

export const registerOnBootHandler = () => {
  registerOnBootTask(async () => {
    console.log("Boot event: Restoring scheduled notifications...");
    const tasksService = await getTasksService();
    await tasksService.restoreNotifications();
  });
};
