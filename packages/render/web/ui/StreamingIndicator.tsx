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

      <style href="streaming-indicator" precedence="high">{`
        .streaming-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 99px;
          
          /* 极简风：背景色 + 柔和投影，无边框 */
          background: var(--background);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          /* 确保在深色模式下阴影稍微深一点，避免发灰 */
          --si-shadow-dark: 0 2px 8px rgba(0, 0, 0, 0.4);
          
          z-index: 10;
        }

        @media (prefers-color-scheme: dark) {
          .streaming-indicator {
            box-shadow: var(--si-shadow-dark);
            /* 深色模式下给一点极淡的白色背景增加层次，避免纯黑 */
            background: rgba(40, 44, 52, 0.9);
          }
        }

        :global(.dark) .streaming-indicator {
           box-shadow: var(--si-shadow-dark);
           background: rgba(40, 44, 52, 0.9);
        }

        .streaming-indicator .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--primary);
          animation: streaming-wave 1.4s infinite ease-in-out both;
        }

        .streaming-indicator .dot:nth-child(1) { animation-delay: 0s; }
        .streaming-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .streaming-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes streaming-wave {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
});

export default StreamingIndicator;
