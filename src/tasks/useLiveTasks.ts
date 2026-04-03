import { useCallback } from "react";
import { Task } from "./db/models";
import tasksRepository from "./db/tasksRepository";
import { useLiveQuery } from "./useLiveQuery";

const useLiveTasks = () => {
  const query = useCallback(() => tasksRepository.getAll(), []);
  const subscribe = useCallback(
    (listener: () => void) => tasksRepository.subscribe(listener),
    [],
  );

  const liveQuery = useLiveQuery<Task[]>(query, subscribe);

  return {
    tasks: liveQuery.data ?? [],
    error: liveQuery.error,
    refresh: liveQuery.refresh,
    isLoading: liveQuery.isLoading,
  };
};

export { useLiveTasks };
