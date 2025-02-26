import React from "react";
import { useEffect, useState } from "react";
import { animations } from "render/styles/animations";
import { selectTheme } from "app/theme/themeSlice";
import { useAppSelector } from "app/hooks";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  Placement,
} from "@floating-ui/react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
  placement?: Placement;
}

export const Tooltip = ({
  content,
  children,
  delay = 200,
  placement = "top",
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useAppSelector(selectTheme);
  const arrowRef = React.useRef(null);

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    delay: { open: delay, close: 0 },
    move: false,
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[placement.split("-")[0]];

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
      })}
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="tooltip-tip"
        >
          <div className="tooltip-content">{content}</div>
          <div
            ref={arrowRef}
            className="tooltip-arrow"
            style={{
              left:
                middlewareData.arrow?.x != null
                  ? `${middlewareData.arrow.x}px`
                  : "",
              top:
                middlewareData.arrow?.y != null
                  ? `${middlewareData.arrow.y}px`
                  : "",
              [staticSide]: "-4px",
            }}
          />
        </div>
      )}

      <style jsx>{`
        .tooltip-tip {
          position: relative;
          border-radius: 6px;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          font-size: 0.875rem;
          line-height: 1.4;
          z-index: 1000;
          box-shadow: 0 4px 12px ${theme.shadowMedium};
          border: 1px solid ${theme.border};
          animation: tooltipFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tooltip-content {
          padding: 6px 12px;
          white-space: nowrap;
        }

        .tooltip-arrow {
          position: absolute;
          width: 8px;
          height: 8px;
          background: ${theme.backgroundSecondary};
          transform: rotate(45deg);
          border: 1px solid ${theme.border};
        }

        .tooltip-arrow::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: inherit;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* 箭头边框样式 */
        .tooltip-arrow[style*="bottom:"] {
          border-top: none;
          border-left: none;
        }
        .tooltip-arrow[style*="top:"] {
          border-bottom: none;
          border-right: none;
        }
        .tooltip-arrow[style*="right:"] {
          border-left: none;
          border-bottom: none;
        }
        .tooltip-arrow[style*="left:"] {
          border-right: none;
          border-top: none;
        }
      `}</style>
    </>
  );
};
