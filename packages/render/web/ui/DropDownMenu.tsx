// 文件路径: render/web/ui/DropDownMenu.tsx

import React, { useEffect, useRef, useState } from "react";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  triggerType?: "click" | "hover";
  direction?: "top" | "bottom" | "left" | "right";
  width?: string | number;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  triggerType = "hover",
  direction = "bottom",
  width,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 处理点击外部关闭逻辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && triggerType === "click") {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, triggerType]);

  const handleMouseEnter = () => {
    if (triggerType === "hover") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (triggerType === "hover") {
      // 增加微小的延时，防止鼠标快速划过间隙时闪烁
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (triggerType === "click") {
      e.stopPropagation(); // 防止冒泡立即触发 document click
      setIsOpen((prev) => !prev);
    }
  };

  // 动态定位样式
  const getPositionStyle = () => {
    const offset = "8px"; // 菜单与触发器的间距
    switch (direction) {
      case "top":
        return {
          bottom: `calc(100% + ${offset})`,
          right: 0,
          transformOrigin: "bottom right",
        };
      case "right":
        return {
          left: `calc(100% + ${offset})`,
          top: 0,
          transformOrigin: "top left",
        };
      case "left":
        return {
          right: `calc(100% + ${offset})`,
          top: 0,
          transformOrigin: "top right",
        };
      case "bottom":
      default:
        return {
          top: `calc(100% + ${offset})`,
          right: 0,
          transformOrigin: "top right",
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className="dropdown-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="dropdown-trigger">{trigger}</div>

      <div
        className={`dropdown-content-wrapper ${isOpen ? "open" : ""}`}
        style={{
          ...getPositionStyle(),
          width: width,
        }}
      >
        <div className="dropdown-content-inner">{children}</div>
      </div>

      <style href="dropdown-menu-styles" precedence="low">{`
        .dropdown-container {
          position: relative;
          display: inline-flex;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .dropdown-content-wrapper {
          position: absolute;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: scale(0.96) translateY(4px);
          transition: 
            opacity 0.2s ease,
            transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.2s;
          pointer-events: none;
        }

        /* 增加一个不可见的伪元素填补间隙，防止 hover 时鼠标滑落 */
        .dropdown-content-wrapper::before {
          content: '';
          position: absolute;
          top: -8px; 
          left: 0; 
          right: 0; 
          bottom: -8px;
          z-index: -1;
        }

        .dropdown-content-wrapper.open {
          opacity: 1;
          visibility: visible;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }

        .dropdown-content-inner {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: var(--shadowMedium);
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DropdownMenu;
