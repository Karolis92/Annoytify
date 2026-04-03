import { DependencyList, useCallback, useEffect, useState } from "react";

const useLiveQuery = <TData>(
  query: () => Promise<TData>,
  subscribe: (listener: () => void) => () => void,
  deps: DependencyList,
) => {
  const [data, setData] = useState<TData>();
  const [error, setError] = useState<Error>();

  const refresh = useCallback(async () => {
    try {
      setData(await query());
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Live query failed."));
    }
  }, [query]);

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, [refresh, subscribe, ...deps]);

  return { data, error, refresh };
};

export { useLiveQuery };
