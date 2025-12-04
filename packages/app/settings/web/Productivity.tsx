import React from "react";
import { useTranslation } from "react-i18next";

const productivityStyles = `
  .productivity-page {
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: var(--space-10);
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--border);
  }

  /* 通用 SettingSection 布局（与 EditorConfig 对齐） */
  .setting-section {
    display: grid;
    grid-template-columns: minmax(200px, 2fr) 3fr;
    gap: var(--space-10);
    align-items: start;
    padding: var(--space-6) 0;
  }

  .setting-section:not(:last-child) {
    border-bottom: 1px solid var(--borderLight);
  }

  .section-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text);
    margin: 0;
    line-height: 1.4;
  }

  .section-description {
    font-size: 0.9rem;
    color: var(--textSecondary);
    margin: 0;
    line-height: 1.5;
  }

  .section-content {
    padding-top: var(--space-1);
  }

  /* 占位盒子，用于后续放列表/表格等 */
  .placeholder-box {
    padding: var(--space-4);
    background-color: var(--backgroundSecondary);
    border-radius: 8px;
    border: 1px solid var(--borderLight);
    color: var(--textSecondary);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  /* 快捷键列表样式（与之前设计统一） */
  .shortcut-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-2) 0;
  }

  .shortcut-action {
    color: var(--text);
    font-size: 0.9rem;
  }

  .shortcut-kbd {
    background: var(--background);
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    color: var(--textTertiary);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 1px 0 var(--shadowLight);
  }

  @media (max-width: 768px) {
    .setting-section {
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .section-header {
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--borderLight);
    }
  }
`;

const SettingSection: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="setting-section">
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      <p className="section-description">{description}</p>
    </div>
    <div className="section-content">{children}</div>
  </section>
);

const Productivity: React.FC = () => {
  const { t } = useTranslation();

  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

  return (
    <>
      <style href="ProductivityPage-styles" precedence="low">
        {productivityStyles}
      </style>

      <div className="productivity-page">
        <h1 className="page-title">
          {t("settings.productivity.title", "效率设置")}
        </h1>

        {/* 变量管理 */}
        <SettingSection
          title={t("settings.productivity.variables.title", "变量管理")}
          description={t(
            "settings.productivity.variables.description",
            "管理你在对话中可以使用的全局变量，减少重复输入，提高使用效率。"
          )}
        >
          <div className="placeholder-box">
            {/* TODO：这里接入真正的变量列表与编辑界面 */}
            {t(
              "settings.productivity.variables.placeholder",
              "这里将展示变量列表，以及用于创建、编辑和删除变量的表单。"
            )}
          </div>
        </SettingSection>

        {/* 键盘快捷键 */}
        <SettingSection
          title={t("settings.productivity.shortcuts.title", "键盘快捷键")}
          description={t(
            "settings.productivity.shortcuts.description",
            "查看并管理常用操作的快捷键配置，让你的工作流更加顺畅。"
          )}
        >
          <ul className="shortcut-list">
            <li className="shortcut-item">
              <span className="shortcut-action">
                {t("toggleSidebar", "切换侧边栏")}
              </span>
              <kbd className="shortcut-kbd">{isMac ? "⌘" : "Ctrl"} + B</kbd>
            </li>

            {/* 以下为示例快捷键，后续可以替换为真实配置或动态数据 */}
            <li className="shortcut-item">
              <span className="shortcut-action">
                {t("settings.productivity.shortcuts.sendMessage", "发送消息")}
              </span>
              <kbd className="shortcut-kbd">{isMac ? "⌘" : "Ctrl"} + Enter</kbd>
            </li>

            <li className="shortcut-item">
              <span className="shortcut-action">
                {t("settings.productivity.shortcuts.newChat", "新建对话")}
              </span>
              <kbd className="shortcut-kbd">{isMac ? "⌘" : "Ctrl"} + N</kbd>
            </li>
          </ul>
        </SettingSection>
      </div>
    </>
  );
};

export default Productivity;
