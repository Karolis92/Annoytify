import { BSON, UpdateMode } from "realm";
import realm from "../../common/db/realm";
import { ITask, Task } from "./models";

class TasksRepository {
  get(id: string | BSON.ObjectId) {
    return realm.objectForPrimaryKey(Task, new BSON.ObjectId(id));
  }

  getOngoing() {
    return realm
      .objects(Task)
      .filtered("date <= $0 && done != true", new Date());
  }

  upsert(task: ITask) {
    return realm.write(() => realm.create(Task, task, UpdateMode.Modified));
  }

  delete(task: Task) {
    realm.write(() => {
      realm.delete(task);
    });
  }

  changeState(task: Task, done = true) {
    realm.write(() => {
      task.done = done;
    });
  }
}

export default new TasksRepository();
