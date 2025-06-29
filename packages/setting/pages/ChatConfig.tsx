import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { VersionsIcon } from "@primer/octicons-react";
import { IoSparklesOutline, IoDocumentTextOutline } from "react-icons/io5"; // 从 react-icons 导入备用图标

/*
 * TODO: 状态管理集成
 * 建议在 Redux store 中创建一个 `chatSlice.ts` 文件来管理对话设置。
 * ... (slice 示例代码保持不变)
 */

// --- 占位符 Redux 交互 (请替换为真实实现) ---
const useChatConfig = () => {
  return {
    autoSummarizeTitle: true,
    titlePrompt: "请为以下对话生成一个简洁的标题：",
    maxMessages: 50,
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

const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({
  enabled,
  onToggle,
}) => {
  const theme = useAppSelector(selectTheme);
  return (
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
  );
};

const ChatConfig: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);
  const config = useChatConfig();
  // const dispatch = useAppDispatch(); // 在集成 Redux 后启用

  return (
    <>
      <style href="ChatConfig-styles" precedence="low">
        {`
          .chat-config-page { max-width: 800px; display: flex; flex-direction: column; gap: ${theme.space[8]}; }
          .page-title { font-size: 1.5rem; font-weight: 600; color: ${theme.text}; margin: 0; padding-bottom: ${theme.space[4]}; border-bottom: 1px solid ${theme.border}; }
          .setting-section { display: grid; grid-template-columns: minmax(200px, 2fr) 3fr; gap: ${theme.space[8]}; align-items: start; }
          .section-header { display: flex; flex-direction: column; gap: ${theme.space[1]}; }
          .section-title { font-size: 1.1rem; font-weight: 500; color: ${theme.text}; margin: 0; }
          .section-description { font-size: 0.9rem; color: ${theme.textSecondary}; margin: 0; line-height: 1.5; }
          .section-content { padding-top: ${theme.space[1]}; display: flex; flex-direction: column; gap: ${theme.space[4]}; }
          .toggle-switch { width: 44px; height: 24px; border-radius: 12px; padding: 2px; position: relative; cursor: pointer; border: none; background-color: var(--switch-bg); transition: background-color 0.2s; }
          .toggle-knob { width: 20px; height: 20px; background-color: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s ease; }
          .toggle-switch.enabled .toggle-knob { transform: translateX(20px); }
          .custom-textarea, .custom-number-input { width: 100%; padding: ${theme.space[2]} ${theme.space[3]}; border-radius: ${theme.borderRadius}; border: 1px solid ${theme.border}; background-color: ${theme.backgroundSecondary}; color: ${theme.text}; font-size: 0.9rem; font-family: inherit; }
          .custom-textarea { min-height: 80px; resize: vertical; }
          .custom-textarea:disabled, .custom-number-input:disabled { background-color: ${theme.backgroundDisabled}; color: ${theme.textDisabled}; cursor: not-allowed; }
          .input-with-icon { display: flex; align-items: center; gap: ${theme.space[3]}; }
          .input-with-icon > svg { color: ${theme.textSecondary}; flex-shrink: 0; }
        `}
      </style>
      <div className="chat-config-page">
        <h1 className="page-title">{t("chat.title", "对话设置")}</h1>

        <SettingSection
          title={t("chat.autoTitle.title", "智能标题")}
          description={t(
            "chat.autoTitle.description",
            "启用后，系统将根据对话内容自动生成一个简洁的标题，方便你识别和查找。"
          )}
        >
          <div className="input-with-icon">
            <IoSparklesOutline size={16} /> {/* <-- 图标已替换 */}
            <ToggleSwitch
              enabled={config.autoSummarizeTitle}
              onToggle={() => {
                /* dispatch(setAutoSummarizeTitle(!config.autoSummarizeTitle)) */
              }}
            />
          </div>
        </SettingSection>

        <SettingSection
          title={t("chat.titlePrompt.title", "标题生成提示词")}
          description={t(
            "chat.titlePrompt.description",
            "自定义用于生成标题的指令。一个好的提示词能让标题更符合你的期望。"
          )}
        >
          <div className="input-with-icon">
            <IoDocumentTextOutline size={16} /> {/* <-- 图标已替换 */}
            <textarea
              className="custom-textarea"
              value={config.titlePrompt}
              onChange={(e) => {
                /* dispatch(setTitlePrompt(e.target.value)) */
              }}
              disabled={!config.autoSummarizeTitle}
            />
          </div>
        </SettingSection>

        <SettingSection
          title={t("chat.maxMessages.title", "上下文消息数量")}
          description={t(
            "chat.maxMessages.description",
            "设置每次对话时携带的历史消息数量。更高的数量能提供更连贯的上下文，但会消耗更多资源。"
          )}
        >
          <div className="input-with-icon">
            <VersionsIcon size={16} /> {/* <-- 此图标有效，予以保留 */}
            <input
              type="number"
              className="custom-number-input"
              value={config.maxMessages}
              onChange={(e) => {
                /* dispatch(setMaxMessages(Number(e.target.value))) */
              }}
              min={1}
              max={1000}
            />
          </div>
        </SettingSection>
      </div>
    </>
  );
};

export default ChatConfig;
