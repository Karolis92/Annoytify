import { BSON } from "realm";
import realm from "../../common/db/realm";
import { Task } from "../db/models";

class TasksService {
  getTask(id: string) {
    return realm.objectForPrimaryKey(Task, new BSON.ObjectId(id));
  }

  getOngoingTasks() {
    return realm
      .objects(Task)
      .filtered("date <= $0 && done != true", new Date());
  }

  markDone(id: string) {
    const task = this.getTask(id);
    if (task) {
      realm.write(() => {
        task.done = true;
      });
    }
  }
}

export default new TasksService();
