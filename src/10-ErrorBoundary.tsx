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
