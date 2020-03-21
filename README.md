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

现在我们已经使用hook编写了这样能fetch data的组件

如果要把其中的逻辑抽象出来, 可以先编写一个自定义hook:

```typescript
import { useState, useCallback, useEffect } from 'react';
import fakeApi from './00-fakeApi';

export default function useData<T>(url: T, timeout = 3000) {
  const [data, setData] = useState<T>();
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

  return { data, isLoading, error, update };
}
```

然后再编写一个组件调用这个hook:

```typescript

```