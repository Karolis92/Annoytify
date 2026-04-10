import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { use } from "react";
import { getTasksService } from "../services/tasksService";

const useTask = (id?: string) => {
  const service = use(getTasksService());
  const { data } = useLiveQuery(service.selectById(id ?? ""), [id]);
  return id ? data[0] : undefined;
};

export default useTask;
