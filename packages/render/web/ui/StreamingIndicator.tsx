// render/web/ui/StreamingIndicator.tsx
import React, { memo } from "react";

const StreamingIndicator = memo(() => {
  return (
    <>
      <div className="streaming-indicator">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>

      {/* 独立样式：使用唯一 href + precedence */}
      <style href="streaming-indicator" precedence="high">{`
        .streaming-indicator {
          position: absolute;
          bottom: -4px;
          right: -6px;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 5px 8px;
          background: var(--background);
          /* 调整：移除边框，使用柔和阴影 (40% 拟物) */
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          border-radius: 50px;
          z-index: 10;
        }

        .streaming-indicator .dot {
          width: 4px;
          height: 4px;
          background-color: var(--primary);
          border-radius: 50%;
          animation: streaming-bounce 1.4s infinite ease-in-out;
        }

        .streaming-indicator .dot:nth-child(1) { animation-delay: 0s; }
        .streaming-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .streaming-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes streaming-bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.3;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
});

export default StreamingIndicator;
