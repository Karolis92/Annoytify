import { Configuration } from "realm";
import { SettingsModels } from "../../settings/db/models";
import { Task, TasksModels } from "../../tasks/db/models";

const realmCfg: Configuration = {
  schema: [...TasksModels, ...SettingsModels],
  schemaVersion: 3,
  onMigration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 2) {
      newRealm.objects(Task).forEach((t) => {
        "next" in t && delete t.next;
      });
    }
  },
};

export default realmCfg;
