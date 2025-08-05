// 文件路径: render/layout/PageContentErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class PageContentErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新 state 以便下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error("页面内容渲染出错:", error, errorInfo);
  }

  handleRefresh = () => {
    // 强制刷新当前页面
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "var(--space-8)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 500,
              color: "var(--text)",
              margin: "0 0 var(--space-2) 0",
            }}
          >
            内容加载失败
          </h2>
          <p
            style={{
              color: "var(--textSecondary)",
              maxWidth: "360px",
              lineHeight: 1.6,
              margin: "0 0 var(--space-6) 0",
            }}
          >
            您可以尝试刷新页面来解决此问题。
          </p>
          <button
            onClick={this.handleRefresh}
            style={{
              padding: "var(--space-2) var(--space-4)",
              border: "1px solid var(--borderHover)",
              background: "var(--background)",
              color: "var(--text)",
              borderRadius: "var(--space-2)",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageContentErrorBoundary;
