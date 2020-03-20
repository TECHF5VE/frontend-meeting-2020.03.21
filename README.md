# Data Fetching and Concurrent Mode

(本文是 2020.03.21 在 TECHF5VE 前端组的技术讨论与分享, 主讲人: [wu-xu-xuan](https://github.com/wu-yu-xuan))

(本文所有实例代码均可在 [src](https://github.com/TECHF5VE/frontend-meeting-2020.03.21/tree/master/src) 目录下找到)

大家好, 今天我要分享的主题是: **Data Fetching and Concurrent Mode**

首先先强调一下思维模式:

**发现问题 -> 分析问题 -> 解决问题 -> 防止问题**

这个思维模式将贯穿此次分享

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