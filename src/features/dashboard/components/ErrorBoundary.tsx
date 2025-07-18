import React, { Component, ReactNode } from 'react';

/**
 * Компонент границы ошибок для перехвата ошибок рендеринга.
 */
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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