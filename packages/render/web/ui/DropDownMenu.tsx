import type React from "react";
import { useCallback, useMemo, useState } from "react";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  triggerType?: "click" | "hover";
  direction?: "top" | "bottom" | "left" | "right";
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  triggerType = "hover",
  direction = "bottom",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (triggerType === "hover") {
      setIsOpen(true);
    }
  }, [triggerType]);

  const handleMouseLeave = useCallback(() => {
    if (triggerType === "hover") {
      setIsOpen(false);
    }
  }, [triggerType]);

  const handleClick = useCallback(() => {
    if (triggerType === "click") {
      setIsOpen(!isOpen);
    }
  }, [triggerType, isOpen]);

  const positionStyle = useMemo(() => {
    switch (direction) {
      case "top":
        return { bottom: "100%", right: 0 };
      case "right":
        return { left: "100%", top: 0 };
      case "left":
        return { right: "100%", top: 0 };
      default:
        return { top: "100%", right: 0 };
    }
  }, [direction]);

  const menuClass = isOpen ? "ddmenu-open" : "ddmenu-closed";

  return (
    <>
      <style>
        {`
          .ddmenu-content {
            opacity: 0;
            transform: scale(0.9);
            transition: opacity 200ms, transform 200ms;
          }

          .ddmenu-open .ddmenu-content {
            opacity: 1;
            transform: scale(1);
          }

          .ddmenu-closed .ddmenu-content {
            opacity: 0;
            transform: scale(0.9);
          }
        `}
      </style>

      <div
        style={{ position: "relative" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {trigger}
        <div
          className={menuClass}
          style={{
            position: "absolute",
            zIndex: 100,
            ...positionStyle,
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <div className="ddmenu-content">{children}</div>
        </div>
      </div>
    </>
  );
};

export default DropdownMenu;
