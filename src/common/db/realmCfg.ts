import { Configuration } from "realm";
import { Task, TasksModels } from "../../tasks/db/models";

const realmCfg: Configuration = {
  schema: [...TasksModels],
  schemaVersion: 1,
  onMigration: (oldRealm, newRealm) => {
    console.log(oldRealm.schemaVersion, newRealm.schemaVersion);
    if (oldRealm.schemaVersion < 1) {
      newRealm.objects(Task).forEach((t) => (t.next = undefined));
    }
  },
};

export default realmCfg;
