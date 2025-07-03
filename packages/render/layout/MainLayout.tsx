// MainLayout.tsx (Final Version with Animations)

import { useAuth } from "auth/hooks/useAuth";
import ChatSidebar from "chat/web/ChatSidebar";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarWidth, selectSidebarWidth } from "app/settings/settingSlice";
import { zIndex } from "render/styles/zIndex";

//web
import TopBar from "./TopBar";
import { SidebarTop } from "./SidebarTop";
import { Outlet, useLocation } from "react-router-dom";
import LifeSidebarContent from "life/LifeSidebarContent";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const sidebarWidth = useSelector(selectSidebarWidth);
  const isOpen = sidebarWidth > 0;

  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastWidthRef = useRef(sidebarWidth);

  useEffect(() => {
    if (sidebarWidth > 0) {
      lastWidthRef.current = sidebarWidth;
    }
  }, [sidebarWidth]);

  let sidebarContent;
  if (location.pathname.startsWith("/life")) {
    sidebarContent = <LifeSidebarContent />;
  } else if (isLoggedIn) {
    sidebarContent = <ChatSidebar />;
  } else {
    sidebarContent = null;
  }

  const hasSidebar = sidebarContent !== null;

  const toggleSidebar = useCallback(() => {
    const newWidth = sidebarWidth > 0 ? 0 : lastWidthRef.current || 260;
    dispatch(setSidebarWidth(newWidth));
  }, [dispatch, sidebarWidth]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      requestAnimationFrame(() => {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 600) {
          dispatch(setSidebarWidth(newWidth));
        }
      });
    },
    [isResizing, dispatch]
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b" && hasSidebar) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar, hasSidebar]);

  useEffect(() => {
    if (!isResizing) return;
    const stopResizing = () => setIsResizing(false);
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, isResizing]);

  useEffect(() => {
    document.body.style.overflow =
      isOpen && isMobile && hasSidebar ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isMobile, hasSidebar]);

  return (
    <>
      <div className="MainLayout">
        {hasSidebar && (
          <aside
            className={`MainLayout__sidebar ${isOpen ? "is-open" : "is-closed"} ${isResizing ? "is-resizing" : ""}`}
            style={{ width: isMobile ? "85%" : sidebarWidth }}
          >
            {isLoggedIn && <SidebarTop />}
            <div className="MainLayout__sidebarContent">{sidebarContent}</div>
            {!isMobile && (
              <div
                className="MainLayout__resizeHandle"
                onMouseDown={startResizing}
              />
            )}
          </aside>
        )}

        {hasSidebar && isOpen && isMobile && (
          <div className="MainLayout__backdrop" onClick={toggleSidebar} />
        )}

        {/* --- 核心修复：移除 main 区域的 style.width，让 flexbox 自动处理动画 --- */}
        <main className={`MainLayout__main ${isResizing ? "is-resizing" : ""}`}>
          <TopBar toggleSidebar={hasSidebar ? toggleSidebar : undefined} />
          <div className="MainLayout__pageContent">
            <Suspense fallback={<div>main Loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <style href="MainLayout-styles" precedence="default">{`
        .MainLayout {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }

        .MainLayout__sidebar {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--backgroundSecondary);
          box-shadow: var(--shadowMedium);
          flex-shrink: 0;
          position: relative;
          z-index: ${zIndex.sidebar};
          overflow: hidden; /* 防止内容在收缩动画时溢出 */
           border-right: 1px solid var(--border);
          /* --- 动画效果: 桌面端 --- */
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* --- 关键：调整大小时禁用动画，以获得流畅的拖拽体验 --- */
        .MainLayout__sidebar.is-resizing,
        .MainLayout__main.is-resizing {
          transition: none !important;
        }

        .MainLayout__sidebarContent {
          flex: 1;
          min-width: 200px; /* 确保内容不会被过度压缩 */
          overflow-y: auto;
          overflow-x: hidden;
        }

        .MainLayout__main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          min-width: 0;
          overflow: hidden;
          /* --- 动画效果: 桌面端主内容区无需添加 transition，flexbox 会自动处理 --- */
        }
        
        .MainLayout__pageContent {
          flex: 1;
          overflow: auto;
          position: relative;
        }

        .MainLayout__resizeHandle {
          position: absolute;
          top: 0;
          right: -2px;
          width: 4px;
          height: 100%;
          cursor: col-resize;
          z-index: ${zIndex.sidebarResizeHandle};
        }
        
        .MainLayout__backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(2px);
          z-index: ${zIndex.sidebarBackdrop};
          animation: fadeIn 0.3s ease;
        }

        /* 移动端样式覆盖: 侧边栏恢复 fixed 定位 */
        @media (max-width: 768px) {
          .MainLayout__sidebar {
            position: fixed;
            width: 85% !important; /* !important 覆盖内联样式 */
            max-width: 320px;
            box-shadow: var(--shadowHeavy);
            transform: translateX(-100%);

            /* --- 动画效果: 移动端 --- */
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .MainLayout__sidebar.is-open {
            transform: translateX(0);
          }
          
          .MainLayout__resizeHandle {
            display: none;
          }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default MainLayout;
