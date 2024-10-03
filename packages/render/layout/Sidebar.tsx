// render/layout/Sidebar.tsx
import React, { useState, useEffect, ReactNode } from "react";
import { ThreeBarsIcon } from "@primer/octicons-react";

// 要求：
// 1. 在所有屏幕尺寸下都可以手动开关侧边栏
// 2. 移动端默认关闭侧边栏，大屏幕默认打开
// 3. 切换按钮不应该遮挡内容
// 4. 使用单个图标来表示开关状态
// 5. 侧边栏即使改变，右侧都可以居中全部撑满
// 6. 右侧内容区域需要能够滑动，适应侧边栏的不同定位变化
// 7. 修复侧边栏展开时页面总宽度超过100%的问题

interface SidebarProps {
  children: ReactNode;
  sidebarContent: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children, sidebarContent }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      setIsSidebarOpen(!newIsMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      <button
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          left: isSidebarOpen ? "266px" : "10px",
          top: "10px",
          zIndex: 1001,
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "left 0.3s",
        }}
      >
        <ThreeBarsIcon size={24} />
      </button>
      <div
        style={{
          width: "256px",
          backgroundColor: "#f3f4f6",
          height: "100vh",
          position: "fixed",
          left: isSidebarOpen ? 0 : "-256px",
          top: 0,
          overflowY: "auto",
          transition: "left 0.3s",
          zIndex: 1000,
        }}
      >
        <nav style={{ padding: "16px", paddingTop: "60px" }}>
          {sidebarContent}
        </nav>
      </div>
      <div
        style={{
          flexGrow: 1,
          marginLeft: isSidebarOpen ? "256px" : 0,
          transition: "margin-left 0.3s",
          width: isSidebarOpen ? "calc(100% - 256px)" : "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "60px 16px 16px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
