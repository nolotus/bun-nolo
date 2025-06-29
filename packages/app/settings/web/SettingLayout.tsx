import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks"; // 假设的 Redux hooks 路径
import { selectTheme } from "app/theme/themeSlice";
import {
  PaintbrushIcon,
  PersonIcon,
  CodeSquareIcon,
  CommentDiscussionIcon,
  GearIcon,
} from "@primer/octicons-react";
import NavListItem from "render/layout/blocks/NavListItem"; // 假设的 NavListItem 组件路径
import { SettingRoutePaths } from "../config"; // 导入更新后的 config

// 重新组织后的导航项，包含路径、翻译key和图标
const useNavItems = () => {
  const { t } = useTranslation();

  return [
    {
      path: SettingRoutePaths.SETTING_APPEARANCE,
      label: t("settings.nav.appearance", "外观"),
      icon: <PaintbrushIcon size={16} />,
    },
    {
      path: SettingRoutePaths.SETTING_ACCOUNT,
      label: t("settings.nav.account", "账户"),
      icon: <PersonIcon size={16} />,
    },
    {
      path: SettingRoutePaths.SETTING_EDITOR,
      label: t("settings.nav.editor", "编辑器"),
      icon: <CodeSquareIcon size={16} />,
    },
    {
      path: SettingRoutePaths.SETTING_CHAT,
      label: t("settings.nav.chat", "对话"),
      icon: <CommentDiscussionIcon size={16} />,
    },
    {
      path: SettingRoutePaths.SETTING_PRODUCTIVITY,
      label: t("settings.nav.productivity", "效率"),
      icon: <GearIcon size={16} />,
    },
  ];
};

const SettingsSidebarContent: React.FC = () => {
  const navItems = useNavItems();
  const { t } = useTranslation();

  return (
    <>
      <h2 className="settings-title">{t("settings.title", "设置")}</h2>
      <nav className="settings-nav">
        {navItems.map((item) => (
          <NavListItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>
    </>
  );
};

const SettingLayout: React.FC = () => {
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <style href="SettingLayout-styles" precedence="medium">
        {`
          .settings-layout {
            display: flex;
            height: 100vh;
            width: 100%;
            background-color: ${theme.background};
            color: ${theme.text};
          }

          .settings-sidebar {
            width: ${theme.sidebarWidth}px;
            flex-shrink: 0;
            border-right: 1px solid ${theme.border};
            padding: ${theme.space[6]} 0;
            display: flex;
            flex-direction: column;
          }
          
          .settings-title {
            font-size: 1.1rem;
            font-weight: 600;
            padding: 0 ${theme.space[6]};
            margin-bottom: ${theme.space[4]};
            color: ${theme.textSecondary};
          }

          .settings-nav {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[1]};
            padding: 0 ${theme.space[4]};
          }

          .settings-content {
            flex: 1;
            padding: ${theme.space[8]};
            overflow-y: auto;
          }
        `}
      </style>
      <div className="settings-layout">
        <div className="settings-sidebar">
          <SettingsSidebarContent />
        </div>
        <main className="settings-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SettingLayout;
