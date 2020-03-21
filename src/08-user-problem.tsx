import React from 'react';
import useData from './05-hook-useData';
import { users, getNextUser, details } from './07-user-mock';

export function UserDetail({ id }: { id: number }) {
  const { data, isLoading } = useData(details[id], 3000 * Math.random());

  if (isLoading) {
    return <div>loading user detail...</div>;
  }
  return <p>{data?.detail}</p>;
}

export function UserPage() {
  const { data, isLoading, update } = useData(users[0], 3000 * Math.random());
  const handleClick = () => {
    update(users[getNextUser(data?.id ?? 0)]);
  };

  if (isLoading) {
    return <div>loading user...</div>;
  }
  return (
    <>
      <button onClick={handleClick}>update user</button>
      <h1>{data?.name}</h1>
      <UserDetail id={data?.id ?? 0} />
    </>
  );
}
