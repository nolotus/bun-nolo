import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

// 这是一个占位符组件，你需要用你实际的组件替换它
const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="setting-section">
    <h2 className="section-title">{title}</h2>
    <div className="section-content">{children}</div>
  </section>
);

const Productivity: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <style href="ProductivityPage-styles" precedence="low">
        {`
          .productivity-page {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[8]};
            max-width: 800px;
          }

          .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${theme.text};
            margin: 0;
            padding-bottom: ${theme.space[4]};
            border-bottom: 1px solid ${theme.border};
          }
          
          .setting-section {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[4]};
          }

          .section-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: ${theme.text};
            margin: 0;
          }

          .section-content {
            padding-left: ${theme.space[2]};
            color: ${theme.textSecondary};
          }

          .placeholder-box {
            padding: 20px;
            background-color: ${theme.backgroundSecondary};
            border-radius: 8px;
            text-align: center;
          }
        `}
      </style>
      <div className="productivity-page">
        <h1 className="page-title">
          {t("settings.productivity.title", "效率设置")}
        </h1>

        <SettingSection
          title={t("settings.productivity.variables.title", "变量管理")}
        >
          <p>
            {t(
              "settings.productivity.variables.description",
              "管理你在对话中可以使用的全局变量，提升重复输入的效率。"
            )}
          </p>
          <div className="placeholder-box">
            {/* TODO: 在这里实现变量列表的增删改查界面 */}
            {t(
              "settings.productivity.variables.placeholder",
              "变量列表和编辑器区域"
            )}
          </div>
        </SettingSection>

        <SettingSection
          title={t("settings.productivity.shortcuts.title", "键盘快捷键")}
        >
          <p>
            {t(
              "settings.productivity.shortcuts.description",
              "自定义常用操作的键盘快捷键，让你的工作流更顺畅。"
            )}
          </p>
          <div className="placeholder-box">
            {/* TODO: 在这里实现快捷键列表和自定义界面 */}
            {t(
              "settings.productivity.shortcuts.placeholder",
              "快捷键列表和编辑器区域"
            )}
          </div>
        </SettingSection>
      </div>
    </>
  );
};

export default Productivity;
