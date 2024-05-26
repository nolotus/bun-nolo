import React, { useState, useRef, useEffect } from "react";

interface DropDownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  triggerType?: "click" | "hover";
  direction?: "top" | "bottom" | "left" | "right";
}

const DropDown: React.FC<DropDownProps> = ({
  trigger,
  children,
  triggerType = "hover",
  direction = "bottom",
}) => {
  const node = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClickOutside = (e: MouseEvent) => {
    if (!node.current || node.current.contains(e.target as Node)) {
      return;
    }
    setIsOpen(false);
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const toggleDropDown = () => setIsOpen((prev) => !prev);

  // 根据 triggerType 来设置不同的事件处理器
  const eventHandlers =
    triggerType === "click"
      ? {
          onClick: toggleDropDown,
        }
      : {
          onMouseEnter: () => setIsOpen(true),
          onMouseLeave: () => setIsOpen(false),
        };
  let positionStyle = {};
  switch (direction) {
    case "top":
      positionStyle = { bottom: "100%", right: 0 };
      break;
    case "right":
      positionStyle = { left: "100%", top: 0 };
      break;
    case "left":
      positionStyle = { right: "100%", top: 0 };
      break;
    case "bottom":
    default:
      positionStyle = { top: "100%", right: 0 };
      break;
  }
  return (
    <div className="relative" ref={node} {...eventHandlers}>
      {trigger}
      {isOpen && (
        <div
          className="absolute"
          style={{
            ...positionStyle,
            transform: "scale(1)",
            opacity: 1,
            zIndex: 2,
            width: "auto",
            minWidth: "56px",
          }}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DropDown;
