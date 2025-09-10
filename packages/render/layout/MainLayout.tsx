// 文件路径: render/layout/MainLayout.tsx

import { useAuth } from "auth/hooks/useAuth";
import ChatSidebar from "chat/web/ChatSidebar";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "app/store";
import { zIndex } from "render/styles/zIndex";
import { setSidebarWidth, selectSidebarWidth } from "app/settings/settingSlice";
import TopBar from "./TopBar";
import { SidebarTop } from "./SidebarTop";
import LifeSidebarContent from "life/LifeSidebarContent";
import PageContentErrorBoundary from "./PageContentErrorBoundary";
import SidebarBottom from "./SidebarBottom";

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const sidebarWidth = useAppSelector(selectSidebarWidth);
  const isOpen = sidebarWidth > 0;

  const [isResizing, setIsResizing] = useState(false);
  // 初始化为 false，以确保在服务端渲染时安全。
  // 真实状态将在客户端的 useEffect 中设置。
  const [isMobile, setIsMobile] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);
  const lastWidthRef = useRef(sidebarWidth);
  const isInitialMount = useRef(true);
  const resizeDebounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  const resize = useCallback((e: MouseEvent) => {
    requestAnimationFrame(() => {
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        if (sidebarRef.current) {
          sidebarRef.current.style.width = `${newWidth}px`;
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const stopResizing = () => {
      if (sidebarRef.current) {
        const finalWidth = parseInt(sidebarRef.current.style.width, 10);
        sidebarRef.current.style.width = "";
        if (!isNaN(finalWidth)) {
          dispatch(setSidebarWidth(finalWidth));
        }
      }
      setIsResizing(false);
    };

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    window.addEventListener("mouseleave", stopResizing);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("mouseleave", stopResizing);
    };
  }, [isResizing, dispatch, resize]);

  // 此 useEffect 仅在客户端运行，用于处理所有与 window/document 相关的交互
  useEffect(() => {
    // 定义一个更新移动端状态的函数
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 在组件挂载到客户端后，立即调用一次以设置正确的初始状态
    updateMobileState();

    // 设置防抖的 resize 处理器
    const debouncedHandleResize = () => {
      if (resizeDebounceTimer.current) {
        clearTimeout(resizeDebounceTimer.current);
      }
      resizeDebounceTimer.current = setTimeout(() => {
        updateMobileState(); // 当窗口大小改变时，调用更新函数
      }, 150);
    };

    // 设置键盘快捷键处理器
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b" && hasSidebar) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    // 绑定事件监听器
    window.addEventListener("resize", debouncedHandleResize);
    document.addEventListener("keydown", handleKeyDown);

    // 在组件卸载时清理所有监听器和计时器
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
      document.removeEventListener("keydown", handleKeyDown);
      if (resizeDebounceTimer.current) {
        clearTimeout(resizeDebounceTimer.current);
      }
    };
  }, [toggleSidebar, hasSidebar]);

  useEffect(() => {
    // 这个 Effect 现在可以在首次渲染后立即正确运行
    if (isInitialMount.current) {
      if (isMobile && isOpen) {
        dispatch(setSidebarWidth(0));
      }
      isInitialMount.current = false;
    }
  }, [isMobile, isOpen, dispatch]);

  useEffect(() => {
    document.body.style.overflow =
      isOpen && isMobile && hasSidebar ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isMobile, hasSidebar]);

  return (
    <>
      <div className={`MainLayout ${isResizing ? "is-resizing" : ""}`}>
        {hasSidebar && (
          <aside
            ref={sidebarRef}
            className={`MainLayout__sidebar ${isOpen ? "is-open" : "is-closed"}`}
            style={{ width: isMobile ? "85%" : sidebarWidth }}
          >
            {isLoggedIn && <SidebarTop />}
            <div className="MainLayout__sidebarContent">{sidebarContent}</div>
            {isLoggedIn && <SidebarBottom />}
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

        <main className="MainLayout__main">
          <TopBar toggleSidebar={hasSidebar ? toggleSidebar : undefined} />
          <div className="MainLayout__pageContent">
            <PageContentErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
              </Suspense>
            </PageContentErrorBoundary>
          </div>
        </main>
      </div>

      <style href="MainLayout-styles" precedence="default">{`
        .MainLayout {
          display: flex;
          min-height: 100dvh;
          background: var(--background);
        }

        .MainLayout.is-resizing {
          cursor: col-resize;
          user-select: none;
        }

        .MainLayout.is-resizing .MainLayout__sidebar,
        .MainLayout.is-resizing .MainLayout__main {
          transition: none !important;
        }

        .MainLayout__sidebar {
          height: 100dvh;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
          z-index: ${zIndex.sidebar};
          overflow: hidden;
          transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          background: var(--background);
          border-right: 1px solid var(--border);
        }

        .MainLayout__sidebarContent {
          flex: 1;
          min-width: ${MIN_WIDTH}px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: var(--textQuaternary) transparent;
        }

        .MainLayout__sidebarContent::-webkit-scrollbar {
          width: 6px;
        }

        .MainLayout__sidebarContent::-webkit-scrollbar-track {
          background: transparent;
        }

        .MainLayout__sidebarContent::-webkit-scrollbar-thumb {
          background: var(--textQuaternary);
          border-radius: 3px;
        }

        .MainLayout__main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100dvh;
          min-width: 0;
          overflow: hidden;
          background: var(--backgroundSecondary);
        }
        
        .MainLayout__pageContent {
          flex: 1;
          overflow: auto;
        }

        .MainLayout__resizeHandle {
          position: absolute;
          top: 0;
          right: -3px;
          width: 6px;
          height: 100%;
          cursor: col-resize;
          z-index: ${zIndex.sidebarResizeHandle};
          display: flex;
          justify-content: center;
        }

        .MainLayout__resizeHandle::after {
          content: '';
          width: 1px;
          height: 100%;
          background: transparent;
          transition: background-color 0.2s ease;
        }

        .MainLayout__resizeHandle:hover::after {
          background: var(--primary);
        }
        
        .MainLayout.is-resizing .MainLayout__resizeHandle::after {
          background: var(--primary);
        }
        
        .MainLayout__backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: ${zIndex.sidebarBackdrop};
          animation: fadeIn 0.24s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .MainLayout__sidebar {
            position: fixed;
            width: 85% !important;
            max-width: 320px;
            box-shadow: var(--shadowHeavy);
            transform: translateX(-100%);
            border-right: none;
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          }
          
          .MainLayout__sidebar.is-open {
            transform: translateX(0);
          }
          
          .MainLayout__resizeHandle {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default MainLayout;
