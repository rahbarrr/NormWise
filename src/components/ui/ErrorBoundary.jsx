/**
 * NormWise Global React Error Boundary (Phase 20)
 * Gracefully captures unhandled frontend exceptions and displays a clean,
 * institutional recovery interface without leaking raw stack traces to the user.
 */

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./Button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[NormWise ErrorBoundary] Caught unexpected UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Something went wrong.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                An unexpected interface error occurred. Your procurement records and database state are safe.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </Button>

              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border-slate-300"
              >
                <Home className="w-4 h-4 text-slate-600" />
                <span>Go to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
