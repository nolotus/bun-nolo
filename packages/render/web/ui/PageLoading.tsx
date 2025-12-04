import React from "react";
import StreamingIndicator from "render/web/ui/StreamingIndicator";

interface PageLoadingProps {
  message?: string;
  fullHeight?: boolean;
  style?: React.CSSProperties;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message, // ✅ 已删除默认文案
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
    ...style,
  };

  return (
    <div role="status" aria-live="polite" style={containerStyle}>
      <div className="loading-capsule">
        <div className="loading-indicator-wrap">
          <StreamingIndicator />
        </div>
        {message && <span className="loading-text">{message}</span>}
      </div>

      <style href="page-loading-styles" precedence="high">{`
        .loading-capsule {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 20px 8px 14px;
          border-radius: 999px;
          background: var(--backgroundGhost, rgba(255,255,255,0.85));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.05),
            0 1px 3px rgba(0, 0, 0, 0.02),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6);
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

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
