import React from 'react';
import useData from './05-hook-useData';

export default function UseCustomHook() {
  const { data, isLoading, error, update } = useData('someUrl');

  if (error) {
    return <div>error: {error?.message}</div>;
  }
  if (isLoading) {
    return <div>loading......</div>;
  }
  return <div onClick={() => update()}>{data}</div>;
}
