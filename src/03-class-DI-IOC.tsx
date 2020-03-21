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
