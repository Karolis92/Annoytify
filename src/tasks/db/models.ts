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

const createFallbackTaskId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;

export const createTaskId = () => {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (randomUuid) {
    return randomUuid();
  }

  return createFallbackTaskId();
};
