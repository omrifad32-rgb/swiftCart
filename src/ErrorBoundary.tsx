import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "white", background: "black", minHeight: "100vh" }}>
          <h1 style={{ color: "red" }}>משהו השתבש (Error)</h1>
          <p>{this.state.errorMsg}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: "20px", padding: "10px 20px", background: "white", color: "black", border: "none", cursor: "pointer" }}
          >
            רענן את הדף
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
