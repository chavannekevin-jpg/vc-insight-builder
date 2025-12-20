import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { AlertTriangle, RefreshCw, Mail } from "lucide-react";

interface Props {
  children: ReactNode;
  sessionId?: string | null;
  companyId?: string | null;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Payment page error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <ModernCard className="max-w-md w-full p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                Don't worry - if your payment was successful, your access has been granted.
              </p>
            </div>

            {(this.props.sessionId || this.props.companyId) && (
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p>Reference: {this.props.sessionId?.slice(0, 20) || this.props.companyId}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={this.handleRetry} className="w-full gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/portal"}
                className="w-full"
              >
                Go to Portal
              </Button>

              <p className="text-xs text-muted-foreground">
                <Mail className="w-3 h-3 inline mr-1" />
                Need help? Contact kev@vc-brain.com with your reference ID
              </p>
            </div>
          </ModernCard>
        </div>
      );
    }

    return this.props.children;
  }
}
