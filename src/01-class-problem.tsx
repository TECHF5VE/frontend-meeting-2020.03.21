import React from 'react';
import fakeApi from './00-fakeApi';

export default class Problem extends React.Component {
  state = {
    data: null
  };
  async update() {
    this.setState({
      data: await fakeApi('someThing')
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
