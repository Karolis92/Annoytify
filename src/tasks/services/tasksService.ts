import { NewTask, Task } from "../../common/db/schema";
import { NotificationChannels } from "../../common/enums/NotificationChannels";
import { PressAction } from "../../common/enums/PressAction";
import { Repeat } from "../../common/enums/Repeat";
import { NotificationRequest, notificationsService } from "../../notifications";
import {
  getNextDailyOccurrence,
  getNextMonthlyOccurrence,
} from "../../common/utils/dateUtils";
import { getTasksRepository, TasksRepository } from "../db/tasksRepository";

class TasksService {
  constructor(private repository: TasksRepository) {}

  selectAll() {
    return this.repository.selectAll();
  }

  selectById(id: string) {
    return this.repository.selectById(id);
  }

  async restoreNotificationsAfterRestart(): Promise<void> {
    const unfinishedTasks = await this.repository.selectUnfinished();
    await Promise.allSettled(
      unfinishedTasks.map((task) => this.showOrScheduleNotification(task)),
    );
  }

  async create(task: NewTask): Promise<Task> {
    const createdTask = await this.repository.create(task);
    await this.showOrScheduleNotification(createdTask);
    return createdTask;
  }

  async update(task: Task): Promise<Task> {
    const updatedTask = await this.repository.update(task);
    // remove notification if already shown
    await notificationsService.cancelNotification(updatedTask.id);
    // schedule new notification
    if (!updatedTask.done) {
      await this.showOrScheduleNotification(updatedTask);
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

  private async showOrScheduleNotification(task: Task): Promise<void> {
    const notification = this.createNotification(task);

    if (task.date <= new Date()) {
      await notificationsService.displayNotification(notification);
      return;
    }

    await notificationsService.scheduleNotification(notification, task.date);
  }

  private createNotification(task: Task): NotificationRequest {
    return {
      id: task.id,
      title: task.title,
      body: task.description,
      channelId: NotificationChannels.Reminders,
      ongoing: true,
      autoCancel: false,
      actions: [
        {
          id: PressAction.Done,
          title: "Done",
        },
      ],
    };
  }
}

const servicePromise = getTasksRepository().then(
  (repository) => new TasksService(repository),
);

export const getTasksService = () => servicePromise;
