import { useCallback, useEffect, useState } from "react";
import { Task } from "./db/models";
import tasksRepository from "./db/tasksRepository";
import { useLiveQuery } from "./useLiveQuery";

const useLiveTasks = () => {
  const liveQuery = useLiveQuery<Task[]>(
    () => tasksRepository.getAll(),
    (onChange) => tasksRepository.subscribe(onChange),
    [],
  );

  const refresh = useCallback(async () => {
    await liveQuery.refresh();
  }, [liveQuery]);

  return { tasks: liveQuery.data ?? [], error: liveQuery.error, refresh };
};

export { useLiveTasks };
