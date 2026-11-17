import React from "react";

/**
 * Global ErrorBoundary — catches uncaught render errors and shows a styled
 * ECOMFY-brand fallback UI instead of a blank/white screen.
 *
 * Usage:  Wrap <App /> (or any sub-tree) in <ErrorBoundary>...</ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Uncaught render error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate to root as fallback
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg =
      this.state.error?.message || "An unexpected error occurred.";

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          fontFamily: "'Inter', sans-serif",
          color: "#e5e2e1",
          gap: "24px",
          textAlign: "center",
        }}
      >
        {/* Brand mark */}
        <div style={{ marginBottom: "8px" }}>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "22px",
              letterSpacing: "-0.03em",
              color: "#fff",
            }}
          >
            ECOMFY
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "11px",
              color: "#F5C518",
              marginLeft: "2px",
            }}
          >
            ™
          </span>
        </div>

        {/* Error icon */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          stroke="rgba(245,197,24,0.3)"
          strokeWidth="1.4"
        >
          <circle cx="24" cy="24" r="20" />
          <line x1="24" y1="14" x2="24" y2="28" strokeLinecap="square" />
          <circle cx="24" cy="34" r="1.5" fill="rgba(245,197,24,0.3)" stroke="none" />
        </svg>

        <div>
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(20px, 5vw, 30px)",
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#fff",
              margin: "0 0 8px 0",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "14px",
              color: "rgba(209,197,172,0.5)",
              margin: 0,
            }}
          >
            {msg}
          </p>
        </div>

        <button
          onClick={this.handleReset}
          style={{
            padding: "13px 36px",
            background: "#F5C518",
            color: "#0a0a0a",
            border: "none",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 40px rgba(245,197,24,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Go Home
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
