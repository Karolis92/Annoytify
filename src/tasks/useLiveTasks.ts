import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import tasksRepository from "./db/tasksRepository";

const useLiveTasks = () => {
  const query = tasksRepository.getAllQuery();
  const liveQuery = useLiveQuery(query);

  return {
    tasks: liveQuery.data ?? [],
    error: liveQuery.error,
    refresh: async () => undefined,
    isLoading: !liveQuery.updatedAt && !liveQuery.error,
  };
};

export { useLiveTasks };
