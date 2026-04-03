import { Repeat } from "../../common/enums/Repeat";

export interface ITask {
  _id: string;
  title: string;
  description: string;
  date: Date;
  repeat: Repeat;
  done: boolean;
}

export type Task = ITask;

export const createTaskId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;
