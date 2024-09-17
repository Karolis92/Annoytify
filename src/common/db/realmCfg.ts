import { Configuration } from "realm";
import { Task, TasksModels } from "../../tasks/db/models";

const realmCfg: Configuration = {
  schema: [...TasksModels],
  schemaVersion: 2,
  onMigration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 2) {
      newRealm.objects(Task).forEach((t) => {
        "next" in t && delete t.next;
      });
    }
  },
};

export default realmCfg;
