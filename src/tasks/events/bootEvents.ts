import { registerOnBootTask } from "../../../modules/on-boot";
import { getTasksService } from "../services/tasksService";

export const registerOnBootListener = () => {
  registerOnBootTask(async () => {
    console.log(
      "Boot event: Restoring due notifications and re-scheduling future reminders...",
    );
    const tasksService = await getTasksService();
    await tasksService.restoreNotificationsAfterRestart();
  });
};
