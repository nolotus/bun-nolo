// setting/pages/ChatConfig.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { FormField } from "render/web/form/FormField";

import FormTitle from "web/form/FormTitle";
import { NumberInput, Input } from "render/web/form/Input";
import ToggleSwitch from "web/ui/ToggleSwitch";

const ChatConfig: React.FC = () => {
  const { t } = useTranslation("setting"); // 假设命名空间为 "setting"
  const theme = useTheme();

  // 状态管理
  const [autoSummarizeTitle, setAutoSummarizeTitle] = useState(false); // 是否自动总结标题
  const [titlePrompt, setTitlePrompt] =
    useState("请为以下对话生成一个简洁的标题："); // 总结标题的提示词
  const [maxMessages, setMaxMessages] = useState(50); // 默认读取最大消息数

  // 加载设置（示例：从 localStorage 加载）
  useEffect(() => {
    const savedSettings = localStorage.getItem("chatConfig");
    if (savedSettings) {
      const { autoSummarizeTitle, titlePrompt, maxMessages } =
        JSON.parse(savedSettings);
      setAutoSummarizeTitle(autoSummarizeTitle);
      setTitlePrompt(titlePrompt);
      setMaxMessages(maxMessages);
    }
  }, []);

  // 保存设置（示例：保存到 localStorage）
  const saveSettings = () => {
    const settings = { autoSummarizeTitle, titlePrompt, maxMessages };
    localStorage.setItem("chatConfig", JSON.stringify(settings));
  };

  // 处理输入变化
  const handleTitlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitlePrompt(e.target.value);
  };

  return (
    <div className="chat-config-container">
      <FormTitle>{t("chatSettings")}</FormTitle>
      <div className="form-layout">
        <section className="form-section">
          <div className="section-title">{t("conversationSettings")}</div>
          <div className="section-content">
            <FormField
              label={t("autoSummarizeTitle")}
              help={t("autoSummarizeTitleHelp", "启用后将自动为对话生成标题")}
              horizontal
              labelWidth="140px"
            >
              <ToggleSwitch
                checked={autoSummarizeTitle}
                onChange={(checked) => setAutoSummarizeTitle(checked)}
              />
            </FormField>

            <FormField
              label={t("titlePrompt")}
              help={t("titlePromptHelp", "用于生成对话标题的提示词")}
              horizontal
              labelWidth="140px"
            >
              <Input
                value={titlePrompt}
                onChange={handleTitlePromptChange}
                placeholder={t("enterTitlePrompt")}
                disabled={!autoSummarizeTitle} // 未开启自动总结时禁用
              />
            </FormField>

            <FormField
              label={t("maxMessages")}
              help={t("maxMessagesHelp", "默认读取的对话消息最大数量")}
              horizontal
              labelWidth="140px"
            >
              <NumberInput
                value={maxMessages}
                onChange={(value) => setMaxMessages(value)}
                placeholder={t("enterMaxMessages")}
                decimal={0} // 限制为整数
                min={1}
                max={1000}
              />
            </FormField>
          </div>
        </section>
      </div>

      <style>{`
        .chat-config-container {
          max-width: 800px;
          margin: 24px auto;
          padding: 0 24px;
        }
        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-bottom: 32px;
        }
        .form-section {
          position: relative;
          padding-left: 16px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.textDim};
          margin: 0 0 24px;
          padding-left: 16px;
          position: relative;
          height: 24px;
          line-height: 24px;
        }
        .section-title::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 8px;
          height: 2px;
          background: ${theme.primary};
          opacity: 0.7;
        }
        .section-content {
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 640px) {
          .chat-config-container {
            padding: 16px;
            margin: 16px auto;
          }
          .form-layout {
            gap: 32px;
          }
          .form-section {
            padding-left: 12px;
          }
          .section-title {
            font-size: 14px;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatConfig;
