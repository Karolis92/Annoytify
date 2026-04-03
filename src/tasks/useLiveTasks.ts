import { useMemo, useState } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Task } from "./db/models";
import tasksRepository from "./db/tasksRepository";

const useLiveTasks = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const query = useMemo(() => tasksRepository.getAllQuery(), [refreshKey]);
  const liveQuery = useLiveQuery(query, [refreshKey]);

  return {
    tasks: (liveQuery.data as Task[] | undefined) ?? [],
    error: liveQuery.error,
    refresh: async () => {
      setRefreshKey((value) => value + 1);
    },
    isLoading: !liveQuery.updatedAt && !liveQuery.error,
  };
};

export { useLiveTasks };
