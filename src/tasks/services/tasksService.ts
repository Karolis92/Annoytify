import { Event, EventType, Notification } from "@notifee/react-native";
import { BSON } from "realm";
import { registerOnBootTask } from "../../../modules/on-boot";
import { NotificationChannels } from "../../common/enums/NotificationChannels";
import { PressAction } from "../../common/enums/PressAction";
import { Repeat } from "../../common/enums/Repeat";
import {
  getNextDailyOccurence,
  getNextMonthlyOccurence,
} from "../../common/utils/dateUtils";
import { ITask, Task } from "../db/models";
import tasksRepository from "../db/tasksRepository";
import notificationsService from "../services/notificationsService";

class TasksService {
  constructor() {
    // show ongoing task notifications after reboot
    registerOnBootTask(async () => {
      const ongoingTasks = tasksRepository.getOngoing();
      ongoingTasks.forEach((task) =>
        notificationsService.displayNotification(this.createNotification(task)),
      );
    });
  }

  async createOrUpdate(task: ITask) {
    const newTask = tasksRepository.upsert(task);
    // remove notification if already shown
    await notificationsService.cancelNotification(newTask._id.toString());
    // schedule new notification
    if (!newTask.done) {
      await notificationsService.scheduleNotification(
        this.createNotification(task),
        task.date,
      );
    }
    return newTask;
  }

  async delete(task: Task) {
    const id = task._id.toString(); // grab id before deletion to avoid error
    tasksRepository.delete(task);
    await notificationsService.cancelNotification(id);
  }

  async changeStateById(id: string, done = true) {
    const task = tasksRepository.get(id);
    if (task) {
      await this.changeState(task, done);
    }
  }

  async changeState(task: Task, done = true) {
    if (done) {
      await this.createNextReocurance(task);
      await this.createOrUpdate({ ...task, done, repeat: Repeat.No });
    } else {
      await this.createOrUpdate({ ...task, done });
    }
  }

  private async createNextReocurance(task: Task) {
    if (task.repeat !== Repeat.No) {
      return await this.createOrUpdate({
        ...task,
        _id: new BSON.ObjectId(),
        done: false,
        date:
          task.repeat === Repeat.Daily
            ? getNextDailyOccurence(task.date)
            : getNextMonthlyOccurence(task.date),
      });
    }
  }

  listenBackgroundEvents() {
    return notificationsService.onBackgroundEvent(this.onNotificationEvent);
  }

  listenForegroundEvents() {
    return notificationsService.onForegroundEvent(this.onNotificationEvent);
  }

  private async onNotificationEvent({ type, detail }: Event) {
    switch (type) {
      case EventType.DISMISSED:
        console.log("User dismissed notification");
        if (detail.notification?.android?.ongoing) {
          await notificationsService.displayNotification(detail.notification);
        }
        break;
      case EventType.PRESS:
        console.log("User pressed notification");
        break;
      case EventType.ACTION_PRESS:
        console.log("User pressed notification's action");
        if (
          detail.notification?.id &&
          detail.pressAction?.id === PressAction.Done
        ) {
          tasksService.changeStateById(detail.notification.id);
        }
        break;
    }
  }

  private createNotification(task: ITask): Notification {
    return {
      id: task._id.toString(),
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

const tasksService = new TasksService();
export default tasksService;
