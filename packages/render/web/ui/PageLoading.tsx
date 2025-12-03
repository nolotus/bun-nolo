import React from "react";
// 原来：import LoadingSpinner from "./LoadingSpinner";
import StreamingIndicator from "render/web/ui/StreamingIndicator"; // 根据实际路径调整

interface PageLoadingProps {
  message?: string;
  minHeight?: string;
  /** 是否在父容器内占满高度并垂直居中 */
  fullHeight?: boolean;
  style?: React.CSSProperties;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message = "加载中...",
  minHeight = "60vh",
  fullHeight = false,
  style,
}) => {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    color: "var(--textSecondary)",
    backgroundColor: "var(--background)",
  };

  const sizeStyle: React.CSSProperties = fullHeight
    ? {
        height: "100%",
        minHeight: 0,
        flex: 1,
      }
    : {
        minHeight,
      };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        ...baseStyle,
        ...sizeStyle,
        ...style,
      }}
    >
      {/* 相对定位的容器，作为 StreamingIndicator 的定位参照 */}
      <div
        style={{
          position: "relative",
          width: 40,
          height: 20,
        }}
      >
        <StreamingIndicator />
      </div>

      {message && (
        <span
          style={{
            fontSize: 14,
            opacity: 0.8,
            fontWeight: 500,
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default PageLoading;
