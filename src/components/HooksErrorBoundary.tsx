import React, { Component, ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

/**
 * Specialized ErrorBoundary that handles React hooks ordering errors.
 * These errors can occur during initial render with async data loading
 * but typically resolve on re-render when data is cached.
 */
export class HooksErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 2;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    // Check if this is a hooks-related error
    const isHooksError = 
      error.message?.includes('hooks') ||
      error.message?.includes('Rendered more hooks') ||
      error.message?.includes('Rendered fewer hooks') ||
      error.message?.includes('310'); // Minified React error #310
    
    if (isHooksError) {
      return { hasError: true };
    }
    
    // Let other errors propagate to parent error boundaries
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[HooksErrorBoundary] Caught hooks error, will retry:', error.message);
    console.debug('Error info:', errorInfo);
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    // If we just caught an error and haven't exceeded retries, schedule a reset
    if (this.state.hasError && !prevState.hasError && this.state.retryCount < this.MAX_RETRIES) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  scheduleRetry = () => {
    // Small delay to let React Query cache populate
    this.retryTimeout = setTimeout(() => {
      this.setState(prev => ({
        hasError: false,
        retryCount: prev.retryCount + 1
      }));
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      // Show brief loading state while retrying
      if (this.state.retryCount < this.MAX_RETRIES) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        );
      }
      
      // Max retries exceeded, show fallback or contact info before reload
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Show contact info before auto-reload
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4 p-6">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Something went wrong. Reloading...</p>
            <p className="text-xs text-muted-foreground">
              If this persists, contact kev@vc-brain.com
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
