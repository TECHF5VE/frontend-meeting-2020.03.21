import React, { useState, useCallback, useEffect } from 'react';
import fakeApi from './00-fakeApi';

export default function HookRaw() {
  const url = 'someThing';
  const [data, setData] = useState<string>();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const update = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setData(await fakeApi(url));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    update();
  }, []);
  const handleClick = useCallback(() => {
    update();
  }, []);

  if (error) {
    return <div>error: {error?.message}</div>;
  }
  if (isLoading) {
    return <div>loading......</div>;
  }
  return <div onClick={handleClick}>{data}</div>;
}
