import React, { Component, ReactNode } from 'react';

/**
 * Компонент границы ошибок для перехвата ошибок рендеринга.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем ошибку только в development режиме
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-pink-400 text-center p-4">
          Произошла ошибка: {this.state.errorMessage || 'Неизвестная ошибка'}. Пожалуйста, обновите страницу.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;