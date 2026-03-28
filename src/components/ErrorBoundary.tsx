import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMsg = this.state.error?.message || 'An unknown error occurred';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error) {
          errorMsg = `Firestore Error: ${parsed.error} (Operation: ${parsed.operationType}, Path: ${parsed.path})`;
        }
      } catch (e) {
        // Not JSON, ignore
      }

      return (
        <div className="flex flex-col items-center justify-center h-screen bg-navy text-text p-4">
          <div className="bg-navy-card border border-red-500/50 p-6 rounded-lg max-w-2xl w-full shadow-lg">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <div className="bg-black/30 p-4 rounded font-mono text-sm text-red-300 overflow-auto max-h-64 whitespace-pre-wrap">
              {errorMsg}
            </div>
            <button
              className="mt-6 px-4 py-2 bg-pepsi text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
