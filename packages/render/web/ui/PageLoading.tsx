import React from "react";
import StreamingIndicator from "render/web/ui/StreamingIndicator";

export interface PageLoadingProps {
  /**
   * 加载中的提示文案，例如：
   * - "正在打开页面，为你准备内容…"
   * - "正在为你准备编辑体验…"
   */
  message?: string;
  /**
   * 是否占满可用高度（用于整页加载）
   */
  fullHeight?: boolean;
}

/**
 * 通用页面加载状态组件：
 * - 居中展示 StreamingIndicator
 * - 支持自定义提示文案
 * - 可选是否占满可用高度
 * - 不对外暴露 style，避免破坏统一布局
 */
const PageLoading: React.FC<PageLoadingProps> = ({
  message,
  fullHeight = true,
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
    gap: 8, // 指示器和文字之间的间距
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
