import React, { memo } from "react";
import { LuChevronDown } from "react-icons/lu";

interface ScrollToBottomButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ScrollToBottomButtonComponent: React.FC<ScrollToBottomButtonProps> = ({
  isVisible,
  onClick,
}) => {
  // 保持 React 渲染树稳定，不直接返回 null，而是用 CSS 控制显隐（可选，但这里用 return null 也可以）
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <style href="scroll-to-bottom-button-styles" precedence="component">{`
        .scroll-to-bottom-button {
          position: fixed; /* 必须是 fixed，相对于视口定位 */
          right: var(--space-6);
          /* 计算此值时要考虑到底部输入框的高度 */
          bottom: calc(var(--headerHeight) + 120px); 
          
          /* 如果在移动端，输入框高度不同，可以使用 media query 调整 */
          
          width: 40px;
          height: 40px;
          
          display: flex;
          align-items: center;
          justify-content: center;
          
          background-color: var(--primary);
          color: #fff;
          border: none;
          border-radius: 50%;
          
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          
          /* 动画 */
          opacity: 0;
          transform: translateY(10px);
          animation: button-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          
          z-index: 100; /* 确保层级足够高 */
          transition: background-color 0.2s, transform 0.2s;
        }

        .scroll-to-bottom-button:hover {
          background-color: var(--primaryHover, #2563eb);
          transform: translateY(-2px);
        }

        @keyframes button-appear {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .scroll-to-bottom-button {
            right: var(--space-4);
            bottom: 100px; /* 移动端调整 */
          }
        }
      `}</style>

      <button
        className="scroll-to-bottom-button"
        onClick={onClick}
        aria-label="滚动到底部"
      >
        <LuChevronDown size={20} />
      </button>
    </>
  );
};

export const ScrollToBottomButton = memo(ScrollToBottomButtonComponent);
