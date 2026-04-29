import { registerOnBootTask } from "../../../modules/on-boot";
import { getTasksService } from "../services/tasksService";

export const registerOnBootListener = () => {
  registerOnBootTask(async () => {
    console.log("Boot event: Reconciling native reminder state with stored tasks...");
    const tasksService = await getTasksService();
    await tasksService.restoreNotificationsAfterRestart();
  });
};
