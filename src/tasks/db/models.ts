import Realm, { BSON, ObjectSchema } from "realm";
import { Repeat } from "../../common/enums/Repeat";

export interface ITask {
  _id: BSON.ObjectId;
  title: string;
  description: string;
  date: Date;
  repeat: Repeat;
  done: boolean;
  next?: BSON.ObjectId;
}

export class Task extends Realm.Object<Task> implements ITask {
  _id!: BSON.ObjectId;
  title!: string;
  description!: string;
  date!: Date;
  repeat!: Repeat;
  done!: boolean;
  next?: BSON.ObjectId;

  static schema: ObjectSchema = {
    name: "Task",
    properties: {
      _id: "objectId",
      title: { type: "string", indexed: "full-text" },
      description: { type: "string", indexed: "full-text" },
      date: "date",
      repeat: "string",
      done: "bool",
      next: "objectId?",
    },
    primaryKey: "_id",
  };
}

export const TasksModels = [Task];
