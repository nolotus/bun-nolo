import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SidebarTop } from "./SidebarTop";
import TopBar from "./TopBar";
import { useAuth } from "auth/hooks/useAuth";
import { setSidebarWidth } from "app/theme/themeSlice";

interface SidebarProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  topbarContent?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  topbarContent,
}) => {
  const { isLoggedIn, user } = useAuth();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const theme = useSelector(selectTheme);

  // 处理侧边栏切换
  const toggleSidebar = useCallback((e?: React.MouseEvent) => {
    setIsHandleHovered(false);
    setIsOpen((prev) => !prev);
    if (e) {
      e.stopPropagation();
    }
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  // 优化：使用 requestAnimationFrame 确保动画平滑
  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      // 只有在拖拽中且侧边栏引用存在时才执行
      if (!isResizing || !sidebarRef.current) return;

      // 使用 requestAnimationFrame 保证在浏览器下一次重绘前执行更新
      requestAnimationFrame(() => {
        const newWidth = Math.round(
          // 优化：四舍五入到整数像素
          mouseMoveEvent.clientX -
            sidebarRef.current!.getBoundingClientRect().left
        );
        // 限制侧边栏宽度在 200px 到 600px 之间
        if (newWidth > 200 && newWidth < 600) {
          dispatch(setSidebarWidth(newWidth));
          // 直接更新 DOM 元素的 width，以提供即时反馈
          if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
          }
        }
      });
    },
    [isResizing, dispatch]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHandleHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHandleHovered(false);
  }, []);

  useEffect(() => {
    if (!sidebarContent) return; // 如果没有侧边栏内容，则不执行以下逻辑

    const handleResize = () => {
      // 当屏幕宽度小于 768px 时，侧边栏默认关闭；否则默认打开
      setIsOpen(window?.innerWidth >= 768);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 监听 Ctrl/Cmd + B 快捷键，用于切换侧边栏
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    handleResize(); // 组件挂载时执行一次，以初始化侧边栏状态
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar, sidebarContent]);

  useEffect(() => {
    if (isResizing) {
      // 拖拽调整宽度时，监听鼠标移动和鼠标抬起事件
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      // 添加一个类到 body，以改变全局光标和禁用文本选择
      document.body.classList.add("no-select-cursor");
    } else {
      // 停止拖拽时移除监听器和 body 类
      document.body.classList.remove("no-select-cursor");
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.classList.remove("no-select-cursor"); // 清理副作用
    };
  }, [resize, stopResizing, isResizing]);

  // 管理移动端侧边栏打开时阻止背景滚动
  useEffect(() => {
    if (isOpen && sidebarContent && window.innerWidth < 768) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll"); // 清理副作用
    };
  }, [isOpen, sidebarContent]);

  return (
    <div className="sidebar-layout">
      {sidebarContent && (
        <>
          <aside
            ref={sidebarRef}
            className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"} ${isResizing ? "is-resizing" : ""}`}
            style={{ width: `${theme.sidebarWidth}px` }}
          >
            {isLoggedIn && <SidebarTop />}
            <div className="sidebar__content">{sidebarContent}</div>
          </aside>

          {/* 侧边栏打开时的调整手柄 (桌面端可见) */}
          {isOpen && sidebarContent && (
            <div
              className="sidebar__resize-handle"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              // 手柄定位在侧边栏边缘
              style={{ left: `${theme.sidebarWidth - 5}px` }}
            >
              {/* 可拖动区域 */}
              <div
                className="sidebar__resize-area"
                onMouseDown={startResizing}
                title="调整侧边栏宽度"
              ></div>
            </div>
          )}

          {/* 新增：移动端侧边栏打开时的遮罩 */}
          {isOpen && sidebarContent && window.innerWidth < 768 && (
            <div
              className="sidebar-backdrop"
              onClick={toggleSidebar} // 点击遮罩关闭侧边栏
            ></div>
          )}
        </>
      )}

      <main
        className={`main-container ${isOpen && sidebarContent ? "main-container--with-sidebar" : ""} ${isResizing ? "is-resizing" : ""}`}
        style={
          isOpen && sidebarContent
            ? {
                // 如果侧边栏打开且有内容，则主内容区向右偏移
                marginLeft: `${theme.sidebarWidth}px`,
                width: `calc(100% - ${theme.sidebarWidth}px)`,
              }
            : {}
        }
      >
        <TopBar
          topbarContent={topbarContent}
          // 只有当有 sidebarContent 时才传递 toggleSidebar 和 isSidebarOpen
          toggleSidebar={sidebarContent ? toggleSidebar : undefined}
          isSidebarOpen={sidebarContent ? isOpen : undefined}
        />
        <div className="main-container__content">{children}</div>
      </main>

      <style>{`
        .sidebar-layout {
          display: flex;
          min-height: 100vh;
          background: ${theme.background};
          position: relative;
          overflow: hidden; /* 隐藏超出布局边界的内容 */
        }

        .sidebar {
          height: 100vh; /* 优化：桌面端使用 100vh 更稳定 */
          position: fixed; /* 固定定位，不随内容滚动 */
          top: 0;
          left: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          background: ${theme.background};
          transition:
            transform 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
            box-shadow 0.25s ease,
            width 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99); /* 添加 width 过渡 */
          /* 默认隐藏在屏幕外，通过 transform 动画显示 */
          transform: translateX(-100%);
          box-shadow: none; /* 默认无阴影 */
          will-change: transform, width; /* 优化：提示浏览器这些属性会变化 */
        }

        /* 优化：拖拽时禁用过渡效果 */
        .sidebar.is-resizing {
            transition: none !important;
        }

        /* 侧边栏关闭状态 */
        .sidebar--closed {
          transform: translateX(-100%);
          box-shadow: none;
        }

        /* 侧边栏打开状态（通用样式，桌面端无阴影） */
        .sidebar--open {
          transform: translateX(0);
        }

        .sidebar__content {
          flex-grow: 1; /* 占据剩余空间 */
          overflow-y: auto; /* 内容超出时滚动 */
          overflow-x: hidden;
          color: ${theme.text};
          scrollbar-width: thin; /* Firefox 滚动条 */
          scrollbar-color: ${theme.textLight} transparent; /* Firefox 滚动条颜色 */
        }

        /* Webkit (Chrome, Safari) 滚动条样式 */
        .sidebar__content::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar__content::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar__content::-webkit-scrollbar-thumb {
          background: ${theme.textLight};
          border-radius: 10px;
        }

        .main-container {
          flex-grow: 1;
          margin-left: 0; /* 默认无左边距 */
          width: 100%; /* 默认宽度 100% */
          background: ${theme.background};
          color: ${theme.text};
          transition:
            margin-left 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
            width 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99);
          position: relative;
          min-height: 100vh;
          will-change: margin-left, width; /* 优化：提示浏览器这些属性会变化 */
        }

        /* 优化：拖拽时禁用过渡效果 */
        .main-container.is-resizing {
            transition: none !important;
        }

        .main-container__content {
          width: 100%;
          max-width: 100%;
          position: relative;
        }

        /* 调整手柄 */
        .sidebar__resize-handle {
          width: 10px; /* 调整手柄的宽度 */
          height: 100vh; /* 优化：桌面端使用 100vh 更稳定 */
          position: fixed;
          top: 0;
          z-index: 15; /* 确保在侧边栏之上 */
          display: flex;
          align-items: center;
          justify-content: center;
          /* 默认隐藏，只在桌面端显示 */
          display: none;
        }

        @media (min-width: 769px) { /* 桌面端才显示调整手柄 */
            .sidebar__resize-handle {
                display: flex;
            }
        }


        /* 可调整宽度的区域 */
        .sidebar__resize-area {
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: col-resize; /* 鼠标样式为左右拉伸 */
          background-color: ${
            isHandleHovered || isResizing ? `${theme.border}30` : "transparent"
          };
          transition: background-color 0.2s ease;
          z-index: 14; /* 确保在手柄本身的可视部分下方 */
        }

        /* 拖拽时，改变全局光标并禁用文本选择 */
        body.no-select-cursor {
          cursor: col-resize !important;
          user-select: none;
          -webkit-user-select: none; /* For Safari */
          -moz-user-select: none; /* For Firefox */
          -ms-user-select: none; /* For IE10+/Edge */
        }

        /* 新增：侧边栏遮罩 */
        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4); /* 半透明黑色 */
          z-index: 9; /* 确保在侧边栏下方，主内容上方 */
          transition: opacity 0.25s ease-out;
        }

        /* 媒体查询：移动端适配 (max-width: 768px) */
        @media (max-width: 768px) {
          /* 移动端侧边栏打开时，添加阴影 */
          .sidebar--open {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05);
          }

          /* 当侧边栏打开时，主内容区不应有左边距，且宽度为 100% */
          .main-container--with-sidebar {
            margin-left: 0 !important;
            width: 100% !important;
          }

          /* 移动端侧边栏打开时，禁止 body 滚动 */
          body.no-scroll {
              overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
