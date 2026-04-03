import { useState } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import tasksRepository from "./db/tasksRepository";

const useLiveTasks = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const liveQuery = useLiveQuery(tasksRepository.getAllQuery(), [refreshKey]);

  return {
    tasks: liveQuery.data ?? [],
    error: liveQuery.error,
    refresh: async () => {
      setRefreshKey((value) => value + 1);
    },
    isLoading: liveQuery.updatedAt == null && !liveQuery.error,
  };
};

export { useLiveTasks };
