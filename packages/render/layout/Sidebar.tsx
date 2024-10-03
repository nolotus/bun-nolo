// render/layout/Sidebar.tsx

import React, { useState, useEffect, ReactNode } from "react";
import {
  HomeIcon,
  PlusIcon,
  CommentDiscussionIcon,
  BeakerIcon,
  SignOutIcon,
} from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "../../app/theme/themeSlice";
import SidebarToggleButton from "./SidebarToggleButton";
import NavListItem from "./blocks/NavListItem";
import { useAuth } from "auth/useAuth";
import { nolotusId } from "core/init";

interface NavItem {
  path: string;
  label: string;
  icon?: JSX.Element;
  allow_users?: string[];
}

interface SidebarProps {
  children: ReactNode;
  sidebarContent: ReactNode;
  onLogout: () => void;
}

const fixedLinks: NavItem[] = [
  { path: "/", label: "Home", icon: <HomeIcon size={16} /> },
  { path: "/add", label: "Add", icon: <PlusIcon size={16} /> },
  { path: "/chat", label: "Chat", icon: <CommentDiscussionIcon size={16} /> },
];

const bottomLinks: NavItem[] = [
  {
    path: "/lab",
    label: "Lab",
    icon: <BeakerIcon size={16} />,
    allow_users: [nolotusId], // Replace with actual nolotusId
  },
];

const allowRule = (user, navItems) => {
  return user
    ? navItems.filter((item) => {
        if (!item.allow_users) {
          return true;
        }
        return item.allow_users.includes(user.userId);
      })
    : navItems;
};

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const theme = useSelector(selectTheme);
  const auth = useAuth();

  const allowedFixedLinks = allowRule(auth?.user, fixedLinks);
  const allowedBottomLinks = allowRule(auth?.user, bottomLinks);

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
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: theme.backgroundColor,
      }}
    >
      {/* 要求1：在所有屏幕尺寸下都可以手动开关侧边栏 */}
      <SidebarToggleButton
        onClick={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      {/* 要求2：移动端默认关闭侧边栏，大屏幕默认打开 */}
      <div
        style={{
          width: "256px",
          backgroundColor: theme.surface1,
          height: "100vh",
          position: "fixed",
          left: isSidebarOpen ? 0 : "-256px",
          top: 0,
          overflowY: "auto",
          transition: "left 0.3s",
          zIndex: theme.zIndex.layer2,
          color: theme.text1,
          padding: theme.sidebarPadding,
          paddingTop: "60px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <nav style={{ flexGrow: 1 }}>
          {allowedFixedLinks.map((item) => (
            <NavListItem key={item.path} {...item} />
          ))}
        </nav>
        <div
          style={{
            marginTop: "auto",
            borderTop: `1px solid ${theme.text2}`,
            paddingTop: theme.spacing.medium,
          }}
        >
          {allowedBottomLinks.map((item) => (
            <NavListItem key={item.path} {...item} />
          ))}
          <NavListItem
            label="Log out"
            icon={<SignOutIcon size={16} />}
            onClick={onLogout}
          />
        </div>
        {/* 要求：sidebarContent 要渲染，默认是一个组件 */}
        {sidebarContent}
      </div>
      {/* 要求3：切换按钮不应该遮挡内容 */}
      {/* 要求4：使用单个图标来表示开关状态 */}
      {/* 要求5：侧边栏即使改变，右侧都可以居中全部撑满 */}
      {/* 要求6：右侧内容区域需要能够滑动，适应侧边栏的不同定位变化 */}
      <div
        style={{
          flexGrow: 1,
          marginLeft: isSidebarOpen ? "256px" : 0,
          transition: "margin-left 0.3s",
          width: isSidebarOpen ? "calc(100% - 256px)" : "100%",
          overflow: "auto",
          backgroundColor: theme.backgroundColor,
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            padding: "60px 16px 16px",
            color: theme.text1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
