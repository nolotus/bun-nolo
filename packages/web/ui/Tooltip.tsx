import React from "react";
import { useEffect, useState } from "react";
import { animations } from "render/styles/animations";
import { selectTheme } from "app/theme/themeSlice";
import { useAppSelector } from "app/hooks";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
}

export const Tooltip = ({ content, children, delay = 200 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const theme = useAppSelector(selectTheme);

  const showTip = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(timeout);
  };

  const hideTip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <div className="tooltip-wrapper">
      {React.cloneElement(children, {
        onMouseEnter: showTip,
        onMouseLeave: hideTip,
      })}
      {isVisible && <div className="tooltip-tip">{content}</div>}

      <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-block;
        }

        .tooltip-tip {
          position: absolute;
          border-radius: 4px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 12px;
          color: ${theme.text};
          background: ${theme.backgroundTertiary};
          font-size: 0.8rem;
          line-height: 1;
          z-index: 100;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          top: -30px;
          opacity: 0.95;
          animation: fadeIn ${animations.duration.fast} ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 4px);
          }
          to {
            opacity: 0.95;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
};
