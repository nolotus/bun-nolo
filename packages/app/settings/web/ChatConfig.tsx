import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectGlobalPrompt,
  setGlobalPrompt,
  selectEnableReadCurrentSpace,
  toggleEnableReadCurrentSpace,
} from "app/settings/settingSlice";
import { TextArea } from "render/web/form/TextArea"; // 根据你的真实路径调整
import {
  LuSparkles,
  LuCircleUserRound,
  LuMessagesSquare,
  LuScanSearch,
} from "react-icons/lu";

/*
 * TODO: 下面两个可以后续迁移到 chatSlice
 */
const useChatConfig = () => {
  return {
    autoSummarizeTitle: true,
    maxMessages: 50,
  };
};

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
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`toggle-switch ${enabled ? "enabled" : ""}`}
      style={
        {
          "--switch-bg": enabled
            ? "var(--primary)"
            : "var(--backgroundTertiary)",
        } as React.CSSProperties
      }
    >
      <span className="toggle-knob" />
    </button>
  );
};

const ChatConfig: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const config = useChatConfig();

  const globalPrompt = useAppSelector(selectGlobalPrompt);
  const enableReadCurrentSpace = useAppSelector(selectEnableReadCurrentSpace);

  return (
    <>
      <style href="ChatConfig-styles" precedence="low">
        {`
          .chat-config-page {
            max-width: 800px;
            display: flex;
            flex-direction: column;
            gap: var(--space-8);
          }

          .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text);
            margin: 0;
            padding-bottom: var(--space-4);
            border-bottom: 1px solid var(--border);
          }

          .setting-section {
            display: grid;
            grid-template-columns: minmax(200px, 2fr) 3fr;
            gap: var(--space-8);
            align-items: start;
          }

          .section-header {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
          }

          .section-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--text);
            margin: 0;
          }

          .section-description {
            font-size: 0.9rem;
            color: var(--textTertiary);
            margin: 0;
            line-height: 1.5;
          }

          .section-content {
            padding-top: var(--space-1);
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
          }

          .toggle-switch {
            width: 44px;
            height: 24px;
            border-radius: 12px;
            padding: 2px;
            position: relative;
            cursor: pointer;
            border: none;
            background-color: var(--switch-bg);
            transition: background-color 0.2s;
          }

          .toggle-knob {
            width: 20px;
            height: 20px;
            background-color: #fff;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: transform 0.2s ease;
          }

          .toggle-switch.enabled .toggle-knob {
            transform: translateX(20px);
          }

          .input-with-icon {
            display: flex;
            align-items: center;
            gap: var(--space-3);
          }

          .input-with-icon > svg {
            color: var(--textSecondary);
            flex-shrink: 0;
          }

          .custom-number-input {
            width: 100%;
            padding: var(--space-2) var(--space-3);
            border-radius: 8px;
            border: 1px solid var(--border);
            background-color: var(--backgroundSecondary);
            color: var(--text);
            font-size: 0.9rem;
            font-family: inherit;
          }

          .custom-number-input:disabled {
            background-color: var(--backgroundTertiary);
            color: var(--textQuaternary);
            cursor: not-allowed;
          }
        `}
      </style>

      <div className="chat-config-page">
        <h1 className="page-title">{t("chat.title", "对话设置")}</h1>

        {/* 通用提示词：用于不同 AI 如何认知用户 */}
        <SettingSection
          title={t("chat.globalPrompt.title", "通用提示词")}
          description={t(
            "chat.globalPrompt.description",
            "用于向不同的 AI 统一介绍你自己、你的偏好和沟通风格，让所有 AI 在理解你时保持一致。"
          )}
        >
          <TextArea
            icon={<LuCircleUserRound size={16} />}
            autoResize
            value={globalPrompt}
            onChange={(e) => {
              dispatch(setGlobalPrompt(e.target.value));
            }}
            placeholder={t(
              "chat.globalPrompt.placeholder",
              "例如：我是一名开发者，喜欢结构清晰、条理分明的回答；代码部分请尽量使用 TypeScript，并附简短说明；当有不确定的地方请先说明假设再给出答案。"
            )}
          />
        </SettingSection>

        {/* 是否开启读取当前空间内容 */}
        <SettingSection
          title={t("chat.readCurrentSpace.title", "读取当前空间内容作为上下文")}
          description={t(
            "chat.readCurrentSpace.description",
            "启用后，助手在回答问题时，可以自动读取当前空间中的文档与笔记，作为补充上下文来理解你的问题。"
          )}
        >
          <div className="input-with-icon">
            <LuScanSearch size={16} />
            <ToggleSwitch
              enabled={enableReadCurrentSpace}
              onToggle={() => dispatch(toggleEnableReadCurrentSpace())}
            />
          </div>
        </SettingSection>

        {/* 智能标题开关（仍然暂存在本地 hook，将来可迁到 chatSlice） */}
        <SettingSection
          title={t("chat.autoTitle.title", "智能标题")}
          description={t(
            "chat.autoTitle.description",
            "启用后，系统将根据对话内容自动生成一个简洁的标题，方便你识别和查找。"
          )}
        >
          <div className="input-with-icon">
            <LuSparkles size={16} />
            <ToggleSwitch
              enabled={config.autoSummarizeTitle}
              onToggle={() => {
                /* 将来: dispatch(setAutoSummarizeTitle(!config.autoSummarizeTitle)) */
              }}
            />
          </div>
        </SettingSection>

        {/* 上下文消息数量 */}
        <SettingSection
          title={t("chat.maxMessages.title", "上下文消息数量")}
          description={t(
            "chat.maxMessages.description",
            "设置每次对话时携带的历史消息数量。更高的数量能提供更连贯的上下文，但会消耗更多资源。"
          )}
        >
          <div className="input-with-icon">
            <LuMessagesSquare size={16} />
            <input
              type="number"
              className="custom-number-input"
              value={config.maxMessages}
              onChange={(e) => {
                /* 将来: dispatch(setMaxMessages(Number(e.target.value))) */
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
