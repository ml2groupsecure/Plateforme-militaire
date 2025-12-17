import React, { type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error);
    // eslint-disable-next-line no-console
    console.error('Component stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neuro-50 dark:bg-gray-900 p-6">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 border border-neuro-200 dark:border-gray-700 rounded-xl p-6">
            <h1 className="text-xl font-semibold text-neuro-900 dark:text-white">Erreur d’affichage</h1>
            <p className="mt-2 text-sm text-neuro-700 dark:text-gray-300">
              Une erreur JavaScript empêche cette page de s’afficher. Ouvre la console du navigateur (F12 → Console)
              et copie-colle la première erreur rouge.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 text-xs whitespace-pre-wrap bg-neuro-50 dark:bg-gray-900 border border-neuro-200 dark:border-gray-700 rounded-lg p-3 text-neuro-800 dark:text-gray-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              className="mt-4 px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
              onClick={() => window.location.reload()}
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
