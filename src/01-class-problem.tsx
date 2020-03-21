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
