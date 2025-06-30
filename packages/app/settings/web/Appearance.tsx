import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
import { ThemePicker } from "app/theme/web/ThemePicker";
import { DarkModeSwitch } from "app/theme/web/DarkModeSwitch";

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
            gap: var(--space-8);
            max-width: 800px;
          }
          
          .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text);
            margin: 0;
            padding-bottom: var(--space-4);
            border-bottom: 1px solid var(--borderLight);
          }
          
          .setting-section {
            display: grid;
            grid-template-columns: minmax(200px, 2fr) 3fr;
            gap: var(--space-6);
            align-items: start;
          }
          
          @media (max-width: 768px) {
            .setting-section {
              grid-template-columns: 1fr; /* 在小屏幕上堆叠 */
              gap: var(--space-4); /* 堆叠时减小间距 */
            }
          }

          .section-header {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
          }
          
          .section-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text);
            margin: 0;
          }
          
          .section-description {
            font-size: 0.875rem;
            color: var(--textTertiary);
            margin: 0;
            line-height: 1.4;
          }
          
          .section-content {
            padding-top: var(--space-1);
          }
        `}
      </style>
      <div className="appearance-page">
        <h1 className="page-title">{t("settings.appearance.title")}</h1>

        <SettingSection
          title={t("settings.appearance.theme.title")}
          description={t("settings.appearance.theme.description")}
        >
          <ThemePicker />
        </SettingSection>

        <SettingSection
          title={t("settings.appearance.mode.title")}
          description={t("settings.appearance.mode.description")}
        >
          <DarkModeSwitch />
        </SettingSection>
      </div>
    </>
  );
};

export default Appearance;
