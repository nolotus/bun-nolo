import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { ThemePicker } from "setting/web/ThemePicker";
import { DarkModeSwitch } from "setting/web/DarkModeSwitch";

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

const Appearance: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <style href="AppearancePage-styles" precedence="low">
        {`
          .appearance-page {
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
            display: grid;
            grid-template-columns: minmax(200px, 2fr) 3fr;
            gap: ${theme.space[8]};
            align-items: start;
          }
          .section-header {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[1]};
          }
          .section-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: ${theme.text};
            margin: 0;
          }
          .section-description {
            font-size: 0.9rem;
            color: ${theme.textSecondary};
            margin: 0;
            line-height: 1.5;
          }
          .section-content {
            padding-top: ${theme.space[1]};
          }
        `}
      </style>
      <div className="appearance-page">
        <h1 className="page-title">
          {t("settings.appearance.title", "外观设置")}
        </h1>

        <SettingSection
          title={t("settings.appearance.theme.title", "主题色彩")}
          description={t(
            "settings.appearance.theme.description",
            "选择一个你喜欢的主题色，它将应用于整个应用的强调色。"
          )}
        >
          <ThemePicker />
        </SettingSection>

        <SettingSection
          title={t("settings.appearance.mode.title", "外观模式")}
          description={t(
            "settings.appearance.mode.description",
            "切换日间或夜间模式以获得最佳的视觉舒适度。"
          )}
        >
          <DarkModeSwitch />
        </SettingSection>
      </div>
    </>
  );
};

export default Appearance;
