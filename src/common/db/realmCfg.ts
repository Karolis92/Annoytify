import { Configuration } from "realm";
import { TasksModels } from "../../tasks/db/models";

const realmCfg: Configuration = {
  schema: [...TasksModels],
};

export default realmCfg;
