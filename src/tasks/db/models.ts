import { InferModel } from "drizzle-orm";
import { tasks } from "../../common/db/sqliteSchema";

export type Task = InferModel<typeof tasks>;
export type ITask = Task;

const createFallbackTaskId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;

export const createTaskId = () => {
  const randomUuidFn = globalThis.crypto?.randomUUID;
  if (randomUuidFn) {
    return randomUuidFn();
  }

  return createFallbackTaskId();
};
