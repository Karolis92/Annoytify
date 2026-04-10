import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { use } from "react";
import { getTasksService } from "../services/tasksService";

const useTasks = () => {
  const service = use(getTasksService());
  const { data } = useLiveQuery(service.selectAll());
  return data;
};

export default useTasks;
