import { registerOnBootTask } from "../../../modules/on-boot";
import { getTasksService } from "../services/tasksService";

export const registerOnBootListener = () => {
  registerOnBootTask(async () => {
    console.log("Boot event: Restoring ongoing notifications...");
    const tasksService = await getTasksService();
    await tasksService.restoreOngoingNotifications();
  });
};
