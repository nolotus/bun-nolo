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
      <style>{`
        .settings { display: flex; min-height: 100vh; width: 100%; background: var(--background); color: var(--text); }
        .sidebar { width: var(--sidebarWidth, 260px); flex-shrink: 0; border-right: 1px solid var(--border); padding: var(--space-6, 16px) 0; display: flex; flex-direction: column; }
        .title { font-size: 1.1rem; font-weight: 600; padding-inline: var(--space-6, 16px); margin: 0 0 var(--space-4, 12px); color: var(--textSecondary); }
        .nav { display: flex; flex-direction: column; gap: var(--space-1, 4px); padding-inline: var(--space-4, 12px); }
        .content { flex: 1; padding: var(--space-8, 24px); overflow: auto; min-width: 0; }
      `}</style>

      <div className="settings">
        <aside className="sidebar">
          <h2 className="title">{t("settings.title", "设置")}</h2>
          <nav className="nav">
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

        <main className="content">
          {/* 仅内容区出现 loading，不影响 Layout */}
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
