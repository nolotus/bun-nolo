import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectEditorDefaultMode,
  selectEditorCodeTheme,
  selectEditorWordCountEnabled,
  selectEditorShortcuts,
  selectEditorFontSize,
  selectEditorAutoSave,
  selectEditorAutoSaveInterval,
  setEditorDefaultMode,
  setEditorCodeTheme,
  toggleEditorWordCount,
  toggleEditorShortcut,
  setEditorFontSize,
  toggleEditorAutoSave,
  setEditorAutoSaveInterval,
} from "app/settings/settingSlice";
import {
  HeadingIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  QuoteIcon,
  CodeIcon,
  TasklistIcon,
  NumberIcon,
  GearIcon,
  ClockIcon,
} from "@primer/octicons-react";

// --- UI 组件 ---
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

const ShortcutToggle: React.FC<{
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ icon, label, enabled, onToggle }) => (
  <div className="shortcut-item">
    <div className="shortcut-label">
      <span className="shortcut-icon">{icon}</span>
      <span>{label}</span>
    </div>
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`toggle-switch ${enabled ? "enabled" : ""}`}
    >
      <span className="toggle-knob" />
    </button>
  </div>
);

const EditorConfig = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux 状态
  const defaultMode = useAppSelector(selectEditorDefaultMode);
  const codeTheme = useAppSelector(selectEditorCodeTheme);
  const wordCountEnabled = useAppSelector(selectEditorWordCountEnabled);
  const shortcuts = useAppSelector(selectEditorShortcuts);
  const fontSize = useAppSelector(selectEditorFontSize);
  const autoSave = useAppSelector(selectEditorAutoSave);
  const autoSaveInterval = useAppSelector(selectEditorAutoSaveInterval);

  const shortcutItems = [
    {
      key: "heading",
      label: t("editor.shortcuts.heading", "标题"),
      icon: <HeadingIcon size={16} />,
    },
    {
      key: "ulist",
      label: t("editor.shortcuts.ulist", "无序列表"),
      icon: <ListUnorderedIcon size={16} />,
    },
    {
      key: "olist",
      label: t("editor.shortcuts.olist", "有序列表"),
      icon: <ListOrderedIcon size={16} />,
    },
    {
      key: "tasklist",
      label: t("editor.shortcuts.tasklist", "任务列表"),
      icon: <TasklistIcon size={16} />,
    },
    {
      key: "quote",
      label: t("editor.shortcuts.quote", "引用"),
      icon: <QuoteIcon size={16} />,
    },
    {
      key: "code",
      label: t("editor.shortcuts.code", "代码块"),
      icon: <CodeIcon size={16} />,
    },
  ];

  const codeThemes = [
    { value: "github-dark", label: "GitHub Dark" },
    { value: "github-light", label: "GitHub Light" },
    { value: "monokai", label: "Monokai" },
    { value: "solarized-light", label: "Solarized Light" },
    { value: "dracula", label: "Dracula" },
  ];

  const fontSizes = [12, 13, 14, 15, 16, 17, 18];
  const autoSaveIntervals = [10, 30, 60, 120, 300]; // 秒

  return (
    <>
      <style href="EditorConfig-styles" precedence="low">
        {`
          .editor-config-page {
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

          /* 分段控制器 */
          .segmented-control {
            display: flex;
            background-color: var(--backgroundSecondary);
            border-radius: 8px;
            padding: var(--space-1);
            border: 1px solid var(--border);
            overflow: hidden;
          }

          .segment-button {
            flex: 1;
            text-align: center;
            padding: var(--space-3) var(--space-4);
            border: none;
            background: none;
            color: var(--textSecondary);
            font-weight: 500;
            font-size: 0.9rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }

          .segment-button:hover {
            color: var(--text);
            background-color: var(--backgroundHover);
          }

          .segment-button.active {
            background-color: var(--background);
            color: var(--text);
            box-shadow: var(--shadowLight);
          }

          /* 自定义选择器 */
          .custom-select {
            width: 100%;
            padding: var(--space-3) var(--space-4);
            border-radius: 8px;
            border: 1px solid var(--border);
            background-color: var(--backgroundSecondary);
            color: var(--text);
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23999%22/%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right var(--space-3) center;
            appearance: none;
            padding-right: var(--space-10);
          }

          .custom-select:hover {
            border-color: var(--borderHover);
            background-color: var(--backgroundHover);
          }

          .custom-select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--focus);
          }

          /* 快捷键列表 */
          .shortcut-list {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
          }

          .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-3) 0;
            border-radius: 6px;
            transition: background-color 0.2s ease;
          }

          .shortcut-item:hover {
            background-color: var(--backgroundHover);
            padding-left: var(--space-3);
            padding-right: var(--space-3);
          }

          .shortcut-label {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            color: var(--text);
            font-size: 0.9rem;
          }

          .shortcut-icon {
            display: flex;
            align-items: center;
            color: var(--textTertiary);
          }

          /* 切换开关 */
          .toggle-switch {
            width: 44px;
            height: 24px;
            border-radius: 12px;
            padding: 2px;
            position: relative;
            cursor: pointer;
            border: none;
            background-color: var(--backgroundTertiary);
            transition: all 0.25s ease;
            flex-shrink: 0;
          }

          .toggle-switch:hover {
            background-color: var(--borderHover);
          }

          .toggle-switch.enabled {
            background-color: var(--primary);
          }

          .toggle-switch.enabled:hover {
            background-color: var(--hover);
          }

          .toggle-knob {
            width: 20px;
            height: 20px;
            background-color: #ffffff;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: transform 0.25s ease;
            box-shadow: var(--shadowLight);
          }

          .toggle-switch.enabled .toggle-knob {
            transform: translateX(20px);
          }

          /* 设置组 */
          .setting-group {
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
          }

          .setting-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: var(--space-4);
          }

          .setting-label {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            color: var(--text);
            font-size: 0.9rem;
          }

          /* 响应式设计 */
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
        `}
      </style>
      <div className="editor-config-page">
        <h1 className="page-title">{t("editor.title", "编辑器设置")}</h1>

        <SettingSection
          title={t("editor.defaultMode.title", "默认编辑模式")}
          description={t(
            "editor.defaultMode.description",
            "选择新建文档时默认使用的编辑器类型。"
          )}
        >
          <div className="segmented-control">
            <button
              className={`segment-button ${defaultMode === "markdown" ? "active" : ""}`}
              onClick={() => dispatch(setEditorDefaultMode("markdown"))}
            >
              Markdown
            </button>
            <button
              className={`segment-button ${defaultMode === "block" ? "active" : ""}`}
              onClick={() => dispatch(setEditorDefaultMode("block"))}
            >
              {t("editor.mode.block", "块编辑器")}
            </button>
          </div>
        </SettingSection>

        <SettingSection
          title={t("editor.codeTheme.title", "代码块主题")}
          description={t(
            "editor.codeTheme.description",
            "为编辑器中的代码块选择一个你喜欢的语法高亮主题。"
          )}
        >
          <select
            className="custom-select"
            value={codeTheme}
            onChange={(e) => dispatch(setEditorCodeTheme(e.target.value))}
          >
            {codeThemes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </SettingSection>

        <SettingSection
          title={t("editor.preferences.title", "编辑器偏好")}
          description={t(
            "editor.preferences.description",
            "配置编辑器的外观和行为设置。"
          )}
        >
          <div className="setting-group">
            <div className="setting-row">
              <span className="setting-label">
                <GearIcon size={16} />
                {t("editor.fontSize", "字体大小")}
              </span>
              <select
                className="custom-select"
                style={{ width: "100px" }}
                value={fontSize}
                onChange={(e) =>
                  dispatch(setEditorFontSize(Number(e.target.value)))
                }
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            <ShortcutToggle
              icon={<ClockIcon size={16} />}
              label={t("editor.autoSave", "自动保存")}
              enabled={autoSave}
              onToggle={() => dispatch(toggleEditorAutoSave())}
            />

            {autoSave && (
              <div className="setting-row">
                <span className="setting-label">
                  {t("editor.autoSaveInterval", "自动保存间隔")}
                </span>
                <select
                  className="custom-select"
                  style={{ width: "120px" }}
                  value={autoSaveInterval}
                  onChange={(e) =>
                    dispatch(setEditorAutoSaveInterval(Number(e.target.value)))
                  }
                >
                  {autoSaveIntervals.map((interval) => (
                    <option key={interval} value={interval}>
                      {interval < 60 ? `${interval}秒` : `${interval / 60}分钟`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </SettingSection>

        <SettingSection
          title={t("editor.wordCount.title", "字数统计")}
          description={t(
            "editor.wordCount.description",
            "在编辑器底部显示实时字数、字符数和阅读时间统计。"
          )}
        >
          <ShortcutToggle
            icon={<NumberIcon size={16} />}
            label={t("editor.wordCount.enable", "显示字数统计")}
            enabled={wordCountEnabled}
            onToggle={() => dispatch(toggleEditorWordCount())}
          />
        </SettingSection>

        <SettingSection
          title={t("editor.shortcuts.title", "文本快捷方式")}
          description={t(
            "editor.shortcuts.description",
            "在输入时自动将特定符号转换为格式化文本，例如输入" -
              "会创建一个列表项。"
          )}
        >
          <div className="shortcut-list">
            {shortcutItems.map((item) => (
              <ShortcutToggle
                key={item.key}
                icon={item.icon}
                label={item.label}
                enabled={shortcuts[item.key] ?? false}
                onToggle={() => dispatch(toggleEditorShortcut(item.key))}
              />
            ))}
          </div>
        </SettingSection>
      </div>
    </>
  );
};

export default EditorConfig;
