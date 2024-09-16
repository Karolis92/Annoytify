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

  createOrUpdate(task: ITask) {
    const newTask = tasksRepository.upsert(task);
    this.scheduleTaskNotification(newTask);
    return newTask;
  }

  private createNextReocurance(task: Task) {
    const existing = task.next && tasksRepository.get(task.next);
    if (!existing && task.repeat !== Repeat.Once) {
      const newTask = this.createOrUpdate({
        ...task,
        _id: new BSON.ObjectId(),
        done: false,
        date:
          task.repeat === Repeat.Daily
            ? getNextDailyOccurence(task.date)
            : getNextMonthlyOccurence(task.date),
      });
      this.createOrUpdate({
        ...task,
        next: newTask._id,
      });
    }
  }

  delete(task: Task) {
    const id = task._id.toString(); // grab id before deletion to avoid error
    tasksRepository.delete(task);
    notificationsService.cancelNotification(id);
  }

  changeState(task: Task, done = true) {
    tasksRepository.changeState(task, done);
    if (done) {
      notificationsService.cancelNotification(task._id.toString());
      this.createNextReocurance(task);
    } else {
      this.scheduleTaskNotification(task);
    }
  }

  private scheduleTaskNotification(task: ITask) {
    notificationsService.scheduleNotification(
      this.createNotification(task),
      task.date,
    );
  }

  changeStateById(id: string, done = true) {
    const task = tasksRepository.get(id);
    if (task) {
      this.changeState(task, done);
    }
  }

  listenBackgroundEvents() {
    notificationsService.onBackgroundEvent(this.onNotificationEvent);
  }

  listenForegroundEvents() {
    return notificationsService.onForegroundEvent(this.onNotificationEvent);
  }

  private async onNotificationEvent({ type, detail }: Event) {
    detail.channel;
    switch (type) {
      case EventType.DISMISSED:
        console.log("User dismissed notification");
        if (detail.notification?.android?.ongoing) {
          notificationsService.displayNotification(detail.notification);
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
