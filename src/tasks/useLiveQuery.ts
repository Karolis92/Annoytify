import { useCallback, useEffect, useState } from "react";

const useLiveQuery = <TData>(
  query: () => Promise<TData>,
  subscribe: (listener: () => void) => () => void,
) => {
  const [data, setData] = useState<TData>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setData(await query());
      setError(undefined);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "unknown error while querying";
      setError(new Error(`Failed to execute live query: ${errMsg}`));
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, [refresh, subscribe]);

  return { data, error, refresh, isLoading };
};

export { useLiveQuery };
