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
