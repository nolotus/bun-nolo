// /chat/web/ScrollToBottomButton.tsx (完整修改版)

import React, { memo } from "react";
import { LuChevronDown } from "react-icons/lu"; // [修改] 遵循技术栈规范

interface ScrollToBottomButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ScrollToBottomButtonComponent: React.FC<ScrollToBottomButtonProps> = ({
  isVisible,
  onClick,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <style href="scroll-to-bottom-button-styles" precedence="component">{`
        .scroll-to-bottom-button {
          /* [核心修改] 改为 fixed 定位，并使用 CSS 变量动态计算 bottom 值 */
          position: fixed;
          right: var(--space-6);
          bottom: calc(var(--message-input-height, 80px) + var(--space-4));
          width: 44px;
          height: 44px;
          
          display: flex;
          align-items: center;
          justify-content: center;
          
          background-color: var(--primary);
          color: white; /* 在主色上，白色通常是最佳选择 */
          border: none;
          border-radius: 50%;
          
          box-shadow: var(--shadowHeavy);
          cursor: pointer;
          opacity: 0; /* 初始为0，通过动画出现 */
          transform: translateY(10px);
          animation: button-appear 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          
          transition: 
            transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            background-color 0.2s ease,
            box-shadow 0.2s ease;
            
          z-index: 10;
          outline: none;
        }

        .scroll-to-bottom-button:hover {
          transform: translateY(-2px) scale(1.05);
          background-color: var(--hover);
          box-shadow: 0 8px 20px var(--shadowMedium);
        }

        .scroll-to-bottom-button:active {
          transform: translateY(0px) scale(1);
          opacity: 0.9;
          box-shadow: var(--shadowLight);
        }

        @keyframes button-appear {
          to {
            opacity: 0.9;
            transform: translateY(0);
          }
        }

        /* 移动端适配 */
        @media (max-width: 768px) {
          .scroll-to-bottom-button {
            width: 40px;
            height: 40px;
            right: var(--space-4);
            /* 在移动端，按钮与输入框的间距可以小一些 */
            bottom: calc(var(--message-input-height, 70px) + var(--space-3));
          }
        }
      `}</style>

      <button
        className="scroll-to-bottom-button"
        onClick={onClick}
        aria-label="滚动到底部"
        title="滚动到底部"
      >
        <LuChevronDown size={20} />
      </button>
    </>
  );
};

export const ScrollToBottomButton = memo(ScrollToBottomButtonComponent);
