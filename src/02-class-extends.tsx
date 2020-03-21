import React from 'react';
import fakeApi from './00-fakeApi';

class FetchComponent extends React.Component {
  state = {
    data: null
  };
  url = '';
  async update() {
    this.setState({
      data: await fakeApi(this.url)
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
