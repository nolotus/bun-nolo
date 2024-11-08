// render/layout/ResizeHandle.tsx

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

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
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
    [isResizing, dispatch, sidebarRef],
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return <div style={resizeHandleStyles(theme)} onMouseDown={startResizing} />;
};

const resizeHandleStyles = (theme: any) => ({
  width: "4px",
  height: "100%",
  position: "absolute" as const,
  top: 0,
  right: 0,
  cursor: "col-resize",
  backgroundColor: theme.border,
});

export default ResizeHandle;
