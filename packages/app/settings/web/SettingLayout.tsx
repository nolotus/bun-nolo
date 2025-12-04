// 文件路径：render/layout/SettingLayout.tsx
import React, { useMemo, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LuPalette,
  LuUser,
  LuCode,
  LuMessageSquare,
  LuGauge,
} from "react-icons/lu";
import NavListItem from "render/layout/blocks/NavListItem";
import { SettingRoutePaths } from "../config";

const SIDEBAR_WIDTH = 260; // 桌面端设置侧边栏的理想宽度

const SettingLayout: React.FC = () => {
  const { t } = useTranslation();

  const navItems = useMemo(
    () => [
      {
        path: SettingRoutePaths.SETTING_APPEARANCE,
        label: t("settings.nav.appearance", "外观"),
        Icon: LuPalette,
      },
      {
        path: SettingRoutePaths.SETTING_ACCOUNT,
        label: t("settings.nav.account", "账户"),
        Icon: LuUser,
      },
      {
        path: SettingRoutePaths.SETTING_EDITOR,
        label: t("settings.nav.editor", "编辑器"),
        Icon: LuCode,
      },
      {
        path: SettingRoutePaths.SETTING_CHAT,
        label: t("settings.nav.chat", "对话"),
        Icon: LuMessageSquare,
      },
      {
        path: SettingRoutePaths.SETTING_PRODUCTIVITY,
        label: t("settings.nav.productivity", "效率"),
        Icon: LuGauge,
      },
    ],
    [t]
  );

  return (
    <>
      <style href="SettingLayout-styles" precedence="default">{`
        /* 整个设置页面的容器 */
        .SettingsLayout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: var(--background);
          color: var(--text);
        }

        /* 左侧导航区域（桌面端） */
        .SettingsLayout__sidebar {
          width: ${SIDEBAR_WIDTH}px;        /* 不再使用全局 --sidebarWidth，避免跟 MainLayout 冲突 */
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          padding: var(--space-6, 16px) 0;
          display: flex;
          flex-direction: column;
          background: var(--background);    /* 保证和主背景一致 */
        }

        .SettingsLayout__title {
          font-size: 1.1rem;
          font-weight: 600;
          padding-inline: var(--space-6, 16px);
          margin: 0 0 var(--space-4, 12px);
          color: var(--textSecondary);
        }

        .SettingsLayout__nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
          padding-inline: var(--space-4, 12px);
        }

        /* 右侧内容区域 */
        .SettingsLayout__content {
          flex: 1;
          padding: var(--space-8, 24px);
          overflow: auto;
          min-width: 0;
          background: var(--backgroundSecondary);
        }

        /* ========== 移动端适配 ========== */
        @media (max-width: 768px) {
          /* 上下布局：上面是“伪侧边栏”（其实是顶部导航），下面是内容 */
          .SettingsLayout {
            flex-direction: column;
          }

          .SettingsLayout__sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding-block: var(--space-4, 12px);
            position: sticky;
            top: 0;
            z-index: 5;
            background: var(--background); /* 防止滚动时透出下面内容 */
          }

          .SettingsLayout__title {
            padding-inline: var(--space-4, 12px);
            margin-bottom: var(--space-2, 8px);
          }

          /* 导航横向滚动，行为更像 Tab */
          .SettingsLayout__nav {
            flex-direction: row;
            align-items: center;
            gap: var(--space-2, 8px);
            padding-inline: var(--space-3, 8px);
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: thin;
            scrollbar-color: var(--textQuaternary) transparent;
          }

          .SettingsLayout__nav::-webkit-scrollbar {
            height: 4px;
          }
          .SettingsLayout__nav::-webkit-scrollbar-track {
            background: transparent;
          }
          .SettingsLayout__nav::-webkit-scrollbar-thumb {
            background: var(--textQuaternary);
            border-radius: 2px;
          }

          .SettingsLayout__content {
            padding: var(--space-4, 16px);
          }
        }
      `}</style>

      <div className="SettingsLayout">
        <aside className="SettingsLayout__sidebar">
          <h2 className="SettingsLayout__title">
            {t("settings.title", "设置")}
          </h2>
          <nav className="SettingsLayout__nav">
            {navItems.map(({ path, label, Icon }) => (
              <NavListItem
                key={path}
                path={path}
                label={label}
                icon={<Icon size={16} />}
              />
            ))}
          </nav>
        </aside>

        <main className="SettingsLayout__content">
          {/* 仅内容区 Suspense，不影响整个 Layout 结构 */}
          <Suspense
            fallback={
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--textSecondary)",
                }}
              >
                加载中...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </>
  );
};

export default SettingLayout;
