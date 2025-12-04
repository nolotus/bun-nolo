import React from "react";
import StreamingIndicator from "render/web/ui/StreamingIndicator";

interface PageLoadingProps {
  message?: string;
  fullHeight?: boolean;
  style?: React.CSSProperties;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message,
  fullHeight = true,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...(fullHeight
      ? {
          height: "100%",
          flex: 1,
          minHeight: "200px",
        }
      : {}),
    padding: 24,
    boxSizing: "border-box",
    gap: 8, // 让指示器和文字之间有一点间距
    ...style,
  };

  return (
    <div role="status" aria-live="polite" style={containerStyle}>
      <div className="loading-indicator-wrap">
        <StreamingIndicator />
      </div>
      {message && <span className="loading-text">{message}</span>}

      <style href="page-loading-styles" precedence="high">{`
        .loading-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--textSecondary);
          letter-spacing: 0.5px;
          opacity: 0.9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }

        .loading-indicator-wrap .streaming-indicator {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default PageLoading;
