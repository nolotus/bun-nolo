// src/chat/messages/ScrollToBottomButton.jsx
import React, { memo } from "react";
import { useTheme } from "app/theme";
import { ChevronDownIcon } from "@primer/octicons-react";

interface ScrollToBottomButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ScrollToBottomButtonComponent: React.FC<ScrollToBottomButtonProps> = ({
  isVisible,
  onClick,
}) => {
  const theme = useTheme();

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <button
        className="scroll-to-bottom-button"
        onClick={onClick}
        aria-label="滚动到底部"
        title="滚动到底部" // 辅助提示
      >
        <ChevronDownIcon size={20} />
      </button>

      <style jsx>{`
        .scroll-to-bottom-button {
          position: absolute;
          right: 24px;
          bottom: 24px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: ${theme.primary};
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            transform 0.2s ease-out,
            opacity 0.2s ease-out,
            background-color 0.2s ease;
          z-index: 10;
          opacity: 0.85;
          outline: none;
        }

        .scroll-to-bottom-button:hover {
          transform: translateY(-2px) scale(1.05);
          opacity: 1;
          background-color: ${theme.primaryHover || theme.primary};
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .scroll-to-bottom-button:active {
          transform: translateY(0px) scale(1);
          opacity: 0.9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .scroll-to-bottom-button {
            right: 16px;
            bottom: 16px;
            width: 40px;
            height: 40px;
          }
          .scroll-to-bottom-button svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </>
  );
};

// 使用 memo 优化，仅当 props 变化时重渲染
export const ScrollToBottomButton = memo(ScrollToBottomButtonComponent);
