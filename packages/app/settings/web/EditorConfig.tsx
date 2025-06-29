import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import {
  MarkdownIcon,
  CodeSquareIcon,
  HeadingIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  QuoteIcon,
  CodeIcon,
  TasklistIcon,
} from "@primer/octicons-react";

/*
 * TODO: 状态管理集成
 * 你需要在你的 Redux store 中创建一个 `editorSlice.ts` 来管理这些状态。
 *
 * 示例 `editorSlice.ts`:
 *
 * import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 *
 * interface EditorState {
 *   defaultMode: 'markdown' | 'block';
 *   codeTheme: string;
 *   shortcuts: { [key: string]: boolean };
 * }
 *
 * const initialState: EditorState = {
 *   defaultMode: 'markdown',
 *   codeTheme: 'github-dark',
 *   shortcuts: { heading: true, ulist: true, olist: true },
 * };
 *
 * const editorSlice = createSlice({
 *   name: 'editor',
 *   initialState,
 *   reducers: {
 *     setDefaultMode: (state, action: PayloadAction<'markdown' | 'block'>) => {
 *       state.defaultMode = action.payload;
 *     },
 *     setCodeTheme: (state, action: PayloadAction<string>) => {
 *       state.codeTheme = action.payload;
 *     },
 *     toggleShortcut: (state, action: PayloadAction<string>) => {
 *       state.shortcuts[action.payload] = !state.shortcuts[action.payload];
 *     },
 *   },
 * });
 *
 * export const { setDefaultMode, setCodeTheme, toggleShortcut } = editorSlice.actions;
 * // ... selectors ...
 * export default editorSlice.reducer;
 */

// --- 占位符 Redux 交互 ---
// 请替换为从你真实的 `editorSlice` 导入
const useEditorConfig = () => {
  // const dispatch = useAppDispatch();
  return {
    defaultMode: "markdown", // useSelector(selectDefaultMode)
    codeTheme: "github-dark", // useSelector(selectCodeTheme)
    shortcuts: {
      heading: true,
      ulist: true,
      olist: true,
      quote: true,
      code: true,
      tasklist: true,
    }, // useSelector(selectShortcuts)
    // setDefaultMode: (mode) => dispatch(setDefaultMode(mode)),
    // setCodeTheme: (theme) => dispatch(setCodeTheme(theme)),
    // toggleShortcut: (key) => dispatch(toggleShortcut(key)),
  };
};
// --- 占位符结束 ---

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
}> = ({ icon, label, enabled, onToggle }) => {
  const theme = useAppSelector(selectTheme);
  return (
    <div className="shortcut-item">
      <div className="shortcut-label">
        {icon}
        <span>{label}</span>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`toggle-switch ${enabled ? "enabled" : ""}`}
        style={
          {
            "--switch-bg": enabled ? theme.primary : theme.backgroundTertiary,
          } as React.CSSProperties
        }
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
};

const EditorConfig = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);
  const config = useEditorConfig();

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
    { value: "monokai", label: "Monokai" },
    { value: "solarized-light", label: "Solarized Light" },
    { value: "dracula", label: "Dracula" },
  ];

  return (
    <>
      <style href="EditorConfig-styles" precedence="low">
        {`
          .editor-config-page { max-width: 800px; display: flex; flex-direction: column; gap: ${theme.space[8]}; }
          .page-title { font-size: 1.5rem; font-weight: 600; color: ${theme.text}; margin: 0; padding-bottom: ${theme.space[4]}; border-bottom: 1px solid ${theme.border}; }
          .setting-section { display: grid; grid-template-columns: minmax(200px, 2fr) 3fr; gap: ${theme.space[8]}; align-items: start; }
          .section-header { display: flex; flex-direction: column; gap: ${theme.space[1]}; }
          .section-title { font-size: 1.1rem; font-weight: 500; color: ${theme.text}; margin: 0; }
          .section-description { font-size: 0.9rem; color: ${theme.textSecondary}; margin: 0; line-height: 1.5; }
          .section-content { padding-top: ${theme.space[1]}; }
          .segmented-control { display: flex; background-color: ${theme.backgroundSecondary}; border-radius: ${theme.borderRadius}; padding: ${theme.space[1]}; border: 1px solid ${theme.border}; }
          .segment-button { flex: 1; text-align: center; padding: ${theme.space[2]} 0; border: none; background: none; color: ${theme.textSecondary}; font-weight: 500; border-radius: ${theme.borderRadius - 2}px; cursor: pointer; transition: all 0.2s; }
          .segment-button.active { background-color: ${theme.background}; color: ${theme.text}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
          .custom-select { width: 100%; padding: ${theme.space[2]} ${theme.space[3]}; border-radius: ${theme.borderRadius}; border: 1px solid ${theme.border}; background-color: ${theme.backgroundSecondary}; color: ${theme.text}; font-size: 0.9rem; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22${theme.textSecondary.replace("#", "%23")}%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right ${theme.space[2]} center; }
          .shortcut-list { display: flex; flex-direction: column; gap: ${theme.space[2]}; }
          .shortcut-item { display: flex; justify-content: space-between; align-items: center; padding: ${theme.space[2]} 0; }
          .shortcut-label { display: flex; align-items: center; gap: ${theme.space[3]}; color: ${theme.text}; }
          .toggle-switch { width: 44px; height: 24px; border-radius: 12px; padding: 2px; position: relative; cursor: pointer; border: none; background-color: var(--switch-bg); transition: background-color 0.2s; }
          .toggle-knob { width: 20px; height: 20px; background-color: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s ease; }
          .toggle-switch.enabled .toggle-knob { transform: translateX(20px); }
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
              className={`segment-button ${config.defaultMode === "markdown" ? "active" : ""}`}
              onClick={() => {
                /* config.setDefaultMode('markdown') */
              }}
            >
              Markdown
            </button>
            <button
              className={`segment-button ${config.defaultMode === "block" ? "active" : ""}`}
              onClick={() => {
                /* config.setDefaultMode('block') */
              }}
            >
              {t("editor.mode.block", "块")}
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
            value={config.codeTheme}
            onChange={(e) => {
              /* config.setCodeTheme(e.target.value) */
            }}
          >
            {codeThemes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </SettingSection>

        <SettingSection
          title={t("editor.shortcuts.title", "文本快捷方式")}
          description={t(
            "editor.shortcuts.description",
            "在输入时自动将特定符号转换为格式化文本，例如输入“- ”会创建一个列表项。"
          )}
        >
          <div className="shortcut-list">
            {shortcutItems.map((item) => (
              <ShortcutToggle
                key={item.key}
                icon={item.icon}
                label={item.label}
                enabled={config.shortcuts[item.key] ?? false}
                onToggle={() => {
                  /* config.toggleShortcut(item.key) */
                }}
              />
            ))}
          </div>
        </SettingSection>
      </div>
    </>
  );
};

export default EditorConfig;
