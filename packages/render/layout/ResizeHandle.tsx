import React, { useCallback, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSidebarWidth } from "app/theme/themeSlice";

interface ResizeHandleProps {
  sidebarRef: React.RefObject<HTMLDivElement>;
  theme: any;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ sidebarRef, theme }) => {
  const dispatch = useDispatch();
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
        if (newWidth > 200 && newWidth < 600) {
          dispatch(setSidebarWidth(newWidth));
        }
      }
    },
    [isResizing, dispatch, sidebarRef]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing, isResizing]);

  return (
    <div
      className="resize-handle"
      onMouseDown={startResizing}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="调整侧边栏宽度"
    >
      <div className="divider-line"></div>

      <style jsx>{`
        .resize-handle {
          width: 10px; /* 收窄的宽度 */
          height: 100%;
          position: absolute;
          top: 0;
          right: -5px;
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          background-color: ${isHovered || isResizing
            ? `${theme.border}50`
            : "transparent"};
          transition: background-color 0.2s ease;
        }

        .divider-line {
          width: 4px; /* 保持竖线宽度不变 */
          height: 40px;
          background-color: ${theme.border};
          border-radius: 2px;
          transform: ${isHovered ? "scaleY(1.2)" : "scaleY(1)"};
          transition:
            transform 0.2s ease,
            background-color 0.2s ease;
        }

        ${isHovered
          ? `
          .divider-line {
            background-color: ${theme.textLight};
          }
        `
          : ""}

        ${isResizing
          ? `
          body {
            cursor: col-resize !important;
            user-select: none;
          }
          
          .divider-line {
            background-color: ${theme.text} !important;
            transform: scaleY(1.3) !important;
          }
        `
          : ""}
      `}</style>
    </div>
  );
};

export default ResizeHandle;
