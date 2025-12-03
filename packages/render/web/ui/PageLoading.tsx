import React from "react";
import StreamingIndicator from "render/web/ui/StreamingIndicator";

interface PageLoadingProps {
  message?: string;
  fullHeight?: boolean;
  style?: React.CSSProperties;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message = "正在思考...", // 调整文案使其更具人味
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
          minHeight: "200px", // 防止并在太矮
        }
      : {}),
    // 背景保持透明或继承，由父级控制，避免这里锁死白色显得突兀
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
          padding: 8px 20px 8px 14px; /* 左侧留给 Indicator 空间，整体平衡 */
          border-radius: 999px;
          
          /* 风格：通透、悬浮、未来感 */
          background: var(--backgroundGhost, rgba(255,255,255,0.85));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          
          /* 克制的精致阴影：内发光 + 柔和外阴影 */
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.05),
            0 1px 3px rgba(0, 0, 0, 0.02),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6);
            
          /* 边框色回退（暗黑模式兼容） */
          border: 1px solid transparent; 
          transition: all 0.3s ease;
        }

        .loading-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--textSecondary);
          letter-spacing: 0.5px;
          opacity: 0.9;
          /* 字体纤细感 */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }
        
        /* 避免 Indicator 内部样式冲突，这里做一个定位wrapper */
        .loading-indicator-wrap .streaming-indicator {
           background: transparent !important; /* 在这里去除indicator自带的底色，融入胶囊 */
           box-shadow: none !important;
           padding: 0;
        }
      `}</style>
    </div>
  );
};

export default PageLoading;
