# Data Fetching and Concurrent Mode

(本文是 2020.03.21 在 TECHF5VE 前端组的技术讨论与分享, 主讲人: [wu-xu-xuan](https://github.com/wu-yu-xuan))

(本文所有实例代码均可在 [src](https://github.com/TECHF5VE/frontend-meeting-2020.03.21/tree/master/src) 目录下找到)

大家好, 今天我要分享的主题是: **Data Fetching and Concurrent Mode**

首先先强调一下思维模式:

**发现问题 -> 分析问题 -> 解决问题 -> 防止问题**

这个思维模式将贯穿此次分享

## Fake Api

为了方便测试, 我们先编写如下的 `fakeApi` 来模拟网络请求

```typescript
export default function fakeApi<T>(data: T, timeout = 3000) {
  return new Promise<T>(resolve => {
    setTimeout(() => {
      resolve(data);
    }, timeout);
  });
}
```

## Data Fetching and Class Component

发送请求, 处理响应是非常常见的前端场景, 当这个场景使用 React 加面向对象理念编写, 很容易写出以下代码:

```typescript
import React from 'react';

export default class Problem extends React.Component {
  state = {
    data: null
  };
  async update() {
    this.setState({
      data: await fetch('someThing')
    });
  }
  componentDidMount() {
    this.update();
  }
  handleClick = () => {
    this.update();
  };
  render() {
    return <div onClick={this.handleClick}>{this.state.data}</div>;
  }
}
```

这份代码实现了当组件挂载和点击时发送请求并更新数据

由于这类逻辑十分常见, 于是就引发了一个问题: **我们如何复用这类逻辑?**

方法一: **编写工具类**, 由于 js 并不是强制面向对象的, 所以也可以使用编写工具函数的方法, 代码中的 `fetch` 也可以是封装的请求函数

这个方法有一个巨大的缺点, 就是无法与当前业务进行深度集成

方法二: **继承与派生**, 这个方法解决了方法一无法与业务深度集成的问题, 代码如下:

```typescript
import React from 'react';

class FetchComponent extends React.Component {
  state = {
    data: null
  };
  url = '';
  async update() {
    this.setState({
      data: await fetch(this.url)
    });
  }
  componentDidMount() {
    this.update();
  }
  handleClick = () => {
    this.update();
  };
}

export default class Extends extends FetchComponent {
  state = {
    ...super.state
    // some other state
  };
  url = 'someUrl';
  componentDidMount() {
    super.componentDidMount();
    // some other logic
  }
  handleClick = () => {
    super.handleClick();
    // some other logic
  };
  render() {
    return <div onClick={this.handleClick}>{this.state.data}</div>;
  }
}
```

看起来挺美好, 假如说我现在要采取 [swr](https://swr.now.sh/) 思想, 即当页面 focus 时重新发请求, 如何使用这个思想编写?

```typescript
class FetchWhenFocusComponent extends FetchComponent { ... }

export default MyComponent extends FetchWhenFocusComponent { ... }
```

所以每多加一个需要抽象的需求就需要增加一个基类?

有同学说啦, 这是因为仅允许单继承

然而历史已经证明了, 多继承会引入更多的问题, [钻石问题](https://www.quora.com/What-is-the-diamond-problem-in-programming)了解一下?

方法三: **DI/IOC**

先看代码:

```typescript
import React from 'react';

export default class DIIOC extends React.Component {
  state = {
    data: null
  };
  constructor(props: {}, private update: (url: string) => Promise<{}>) {
    super(props);
  }
  async componentDidMount() {
    const data = await this.update('someUrl');
    this.setState({ data });
  }
  handleClick = async () => {
    const data = await this.update('someUrl');
    this.setState({ data });
  };
  render() {
    return <div onClick={this.handleClick}>{this.state.data}</div>;
  }
}
```

可以说, DI/IOC 几乎完美的解决了复用逻辑在面向对象方面的问题

仅需要在 `constructor` 里注册相应的服务即可

Angular 就是这种方法的集大成者

缺点是什么? 还是那句话, **难以与业务进行深度集成, 即难以影响生命周期函数**

## Data Fetching and Hook

**hook 的目的在于解决 class 难以解决的逻辑复用问题**

同样的网络请求逻辑, 如何使用 hook 编写呢?

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import fakeApi from './00-fakeApi';

export default function HookRaw() {
  const url = 'someThing';
  const [data, setData] = useState<string>('');
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const update = useCallback(async () => {
    setLoading(true);
    setError(null);
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
```

现在我们已经使用 hook 编写了这样能 fetch data 的组件

如果要把其中的逻辑抽象出来, 可以先编写一个自定义 hook:

```typescript
import { useState, useCallback, useEffect } from 'react';
import fakeApi from './00-fakeApi';

export default function useData<T>(url: T, timeout = 3000) {
  const [data, setData] = useState<T>();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const update = useCallback(async (newUrl?: T) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fakeApi(newUrl ?? url));
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
```

然后再编写一个组件调用这个 hook:

```typescript
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
  return <div onClick={update}>{data}</div>;
}
```

瞧, 一方面达到了**复用逻辑**的目的, 另一方面**代码也变得干净整洁, 提高了可维护性和可读性**

## Data Fetching and Suspense

看起来挺美好, 直到产品经理加了需求:

我需要一个用户页, 包含用户名称与用户详情

首先编写 mock 数据:

```typescript
export const users = [
  {
    id: 0,
    name: '0-aa'
  },
  {
    id: 1,
    name: '1-bb'
  },
  {
    id: 2,
    name: '2-cc'
  }
];

export const details = [
  {
    id: 0,
    detail: '0-detail'
  },
  {
    id: 1,
    detail: '1-detail'
  },
  {
    id: 2,
    detail: '2-detail'
  }
];

export function getNextUser(currentId: number) {
  return currentId === 2 ? 0 : currentId + 1;
}
```

然后使用刚刚我们讨论的`useData`编写组件:

```typescript
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
```

为了模拟真实网络情况, 特地加上了 `Math.random()`

看起来十分美好, 我不禁满意的鼓起了掌

且慢, 这串代码真的没有问题吗?

---

- **瀑布问题**
- **竞速问题**

这两个问题都可以使用现有的方法规避和解决, 但是代码会更臃肿, 更难以复用, 而且很容易忽略

比如上面的代码就忽略了错误处理

所以, 是时候安利 `Suspense` 了

首先, 我们编写 `usePromise`, 一方面设立缓存, 另一方面将错误与异步抛出

```typescript
interface Cache<T = any> {
  data: T;
  error: Error | typeof initError;
  promise: Promise<T>;
}

const cache: { [key: string]: Cache } = {};

/**
 * 以前初始值是 `undefined`, 当 `promise` 返回 `undefined` 时会引起递归
 */
const initData = Symbol('init data');
const initError = Symbol('no error');

export default function usePromise<T extends any[], Data = any>(
  fn: (...args: T) => Promise<Data>,
  ...args: T
): Data {
  const key = fn.name + args.toString();
  if (!cache[key]) {
    cache[key] = {
      data: initData,
      error: initError,
      promise: fn(...args)
        .then(data => (cache[key].data = data))
        .catch(error => (cache[key].error = error))
    };
  }
  if (cache[key].data === initData && cache[key].error === initError) {
    throw cache[key].promise;
  }
  if (cache[key].error !== initError) {
    throw cache[key].error;
  }
  return cache[key].data;
}
```

然后编写错误处理组件:

```typescript
import React from 'react';

export interface ErrorBoundaryProps extends React.PropsWithChildren<{}> {
  fallback: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    const { fallback, children } = this.props;
    return this.state.error ? fallback : children;
  }
}
```

最后编写组件:

```typescript
import React, { Suspense, useState } from 'react';
import usePromise from './09-usePromise';
import fakeApi from './00-fakeApi';
import { details, users, getNextUser } from './07-user-mock';
import ErrorBoundary from './10-ErrorBoundary';

function getUserDetail(id: number) {
  return fakeApi(details[id], 3000 * Math.random());
}

function useUserDetail(id: number) {
  return usePromise(getUserDetail, id);
}

export function NewUserDetail({ id }: { id: number }) {
  const { detail } = useUserDetail(id);
  return <div>{detail}</div>;
}

function getUser(id: number) {
  return fakeApi(users[id], 3000 * Math.random());
}

function useUser(id: number) {
  return usePromise(getUser, id);
}

export function NewUser({ id }: { id: number }) {
  const { name } = useUser(id);
  return <h1>{name}</h1>;
}

export function UserDetailWrapper({ id }: { id: number }) {
  return (
    <ErrorBoundary fallback={<div>error!</div>}>
      <Suspense fallback={<div>loading user detail...</div>}>
        <NewUserDetail id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function UserWrapper({ id }: { id: number }) {
  return (
    <ErrorBoundary fallback={<div>error!</div>}>
      <Suspense fallback={<div>loading user...</div>}>
        <NewUser id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function UserPage() {
  const [id, setId] = useState(0);
  const handleClick = () => {
    setId(getNextUser(id));
  };
  return (
    <>
      <button onClick={handleClick}>next</button>
      <UserWrapper id={id} />
      <UserDetailWrapper id={id} />
    </>
  );
}
```

这样编写的组件就可以完美解决刚刚提到的**瀑布问题**与**竞速问题**, 思考, 为什么?
