import { Notification } from "@notifee/react-native";
import { NewTask, Task } from "../../common/db/schema";
import { NotificationChannels } from "../../common/enums/NotificationChannels";
import { PressAction } from "../../common/enums/PressAction";
import { Repeat } from "../../common/enums/Repeat";
import {
  getNextDailyOccurrence,
  getNextMonthlyOccurrence,
} from "../../common/utils/dateUtils";
import { getTasksRepository, TasksRepository } from "../db/tasksRepository";
import notificationsService from "./notificationsService";

class TasksService {
  constructor(private repository: TasksRepository) {}

  selectAll() {
    return this.repository.selectAll();
  }

  selectById(id: string) {
    return this.repository.selectById(id);
  }

  async restoreOngoingNotifications(): Promise<void> {
    const ongoingTasks = await this.repository.selectOngoing();
    await Promise.allSettled(
      ongoingTasks.map((task) =>
        notificationsService.displayNotification(this.createNotification(task)),
      ),
    );
  }

  async create(task: NewTask): Promise<Task> {
    const createdTask = await this.repository.create(task);
    await notificationsService.scheduleNotification(
      this.createNotification(createdTask),
      createdTask.date,
    );
    return createdTask;
  }

  async update(task: Task): Promise<Task> {
    const updatedTask = await this.repository.update(task);
    // remove notification if already shown
    await notificationsService.cancelNotification(updatedTask.id);
    // schedule new notification
    if (!updatedTask.done) {
      await notificationsService.scheduleNotification(
        this.createNotification(updatedTask),
        updatedTask.date,
      );
    }
    return updatedTask;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
    await notificationsService.cancelNotification(id);
  }

  async changeStateById(id: string, done = true): Promise<void> {
    const [task] = await this.repository.selectById(id);
    if (task) {
      await this.changeState(task, done);
    }
  }

  async changeState(task: Task, done = true): Promise<void> {
    if (done) {
      await this.createNextRecurrence(task);
      await this.update({ ...task, done, repeat: Repeat.No });
    } else {
      await this.update({ ...task, done });
    }
  }

  private async createNextRecurrence(task: Task): Promise<void> {
    if (task.repeat !== Repeat.No) {
      await this.create({
        ...task,
        id: undefined,
        done: false,
        date:
          task.repeat === Repeat.Daily
            ? getNextDailyOccurrence(task.date)
            : getNextMonthlyOccurrence(task.date),
      });
    }
  }

  private createNotification(task: Task): Notification {
    return {
      id: task.id,
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
}

const servicePromise = getTasksRepository().then(
  (repository) => new TasksService(repository),
);

export const getTasksService = () => servicePromise;
