import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-pink-400 text-center p-4">
          Произошла ошибка при рендеринге. Пожалуйста, обновите страницу.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;