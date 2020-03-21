import { useState, useCallback, useEffect } from 'react';
import fakeApi from './00-fakeApi';

export default function useData<T>(url: T, timeout = 3000) {
  const [data, setData] = useState<T>();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const update = useCallback(async (newUrl?: T) => {
    setLoading(true);
    setError(undefined);
    try {
      setData(await fakeApi(newUrl ?? url, timeout));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    update();
  }, []);

  return { data, isLoading, error, update };
}
