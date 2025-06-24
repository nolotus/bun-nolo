import React, { useEffect } from "react";
import { Dropdown } from "web/form/Dropdown";
import { CheckIcon, EyeIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";
import type { Model } from "./types";

// 导入所有提供商的模型
import { deepinfraModels } from "integrations/deepinfra/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { googleModels } from "integrations/google/models";
import { mistralModels } from "integrations/mistral/models";
import { openAIModels } from "integrations/openai/models";
import { sambanovaModels } from "integrations/sambanova/models";
import { openrouterModels } from "integrations/openrouter/models";
import { xaiModels } from "integrations/xai/models";

interface AllModelsSelectorProps {
  watch: (name: string) => any;
  setValue: (name: string, value: any) => void;
  register: any;
  defaultModel?: string;
  t: (key: string) => string;
}

interface ModelWithProvider extends Model {
  provider: string;
}

// 提供商配置
const PROVIDER_CONFIG: Record<string, { label: string; color: string }> = {
  mistral: { label: "Mistral", color: "#FF7000" },
  google: { label: "Google", color: "#4285f4" },
  openai: { label: "OpenAI", color: "#10a37f" },
  openrouter: { label: "OpenRouter", color: "#8B5CF6" },
  xai: { label: "xAI", color: "#000000" },
  deepseek: { label: "DeepSeek", color: "#2563eb" },
  fireworks: { label: "Fireworks", color: "#f59e0b" },
  deepinfra: { label: "DeepInfra", color: "#7c3aed" },
  sambanova: { label: "SambaNova", color: "#dc2626" },
};

// 合并所有模型并添加提供商信息
const ALL_MODELS: ModelWithProvider[] = [
  ...mistralModels.map((m) => ({ ...m, provider: "mistral" })),
  ...googleModels.map((m) => ({ ...m, provider: "google" })),
  ...openAIModels.map((m) => ({ ...m, provider: "openai" })),
  ...openrouterModels.map((m) => ({ ...m, provider: "openrouter" })),
  ...xaiModels.map((m) => ({ ...m, provider: "xai" })),
  ...deepSeekModels.map((m) => ({ ...m, provider: "deepseek" })),
  ...fireworksmodels.map((m) => ({ ...m, provider: "fireworks" })),
  ...deepinfraModels.map((m) => ({ ...m, provider: "deepinfra" })),
  ...sambanovaModels.map((m) => ({ ...m, provider: "sambanova" })),
];

const AllModelsSelector: React.FC<AllModelsSelectorProps> = ({
  watch,
  setValue,
  register,
  defaultModel,
  t,
}) => {
  const theme = useTheme();

  // 设置默认值
  const selectedModel = watch("model")
    ? ALL_MODELS.find((m) => watch("model") === m.name)
    : defaultModel
      ? ALL_MODELS.find((m) => m.name === defaultModel)
      : ALL_MODELS.find((m) => m.provider === "mistral") || null;

  // 初始化时将默认值设置到表单中
  useEffect(() => {
    if (selectedModel && !watch("model")) {
      setValue("model", selectedModel.name);
      setValue("provider", selectedModel.provider);
    }
  }, [selectedModel, watch, setValue]);

  return (
    <>
      <Dropdown
        items={ALL_MODELS}
        selectedItem={selectedModel}
        onChange={(item) => {
          if (item) {
            setValue("model", item.name);
            setValue("provider", item.provider);
          } else {
            setValue("model", "");
            setValue("provider", "");
          }
        }}
        labelField="name"
        valueField="name"
        placeholder={t("selectModel")}
        renderOptionContent={(item, isHighlighted, isSelected) => {
          const providerConfig = PROVIDER_CONFIG[item.provider];

          return (
            <div className="model-option">
              <div className="model-main-info">
                <div className="model-name-row">
                  <span className="model-name">{item.name}</span>
                  <div
                    className="provider-badge"
                    style={{
                      backgroundColor: `${providerConfig?.color}15`,
                      borderColor: `${providerConfig?.color}30`,
                      color: providerConfig?.color,
                    }}
                  >
                    {providerConfig?.label || item.provider}
                  </div>
                </div>

                {item.description && (
                  <div className="model-description">{item.description}</div>
                )}
              </div>

              <div className="model-indicators">
                {item.hasVision && (
                  <div className="vision-badge" title={t("supportsVision")}>
                    <EyeIcon size={12} />
                    <span>{t("vision")}</span>
                  </div>
                )}

                {isSelected && (
                  <div className="check-indicator">
                    <CheckIcon size={16} />
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />

      <style href="model-selector" precedence="medium">{`
        .model-option {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: ${theme.space[3]};
          padding: ${theme.space[3]} 0;
          min-height: 44px;
          transition: all 0.2s ease;
        }

        .model-main-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
        }

        .model-name-row {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          margin-bottom: ${theme.space[1]};
        }

        .model-name {
          font-weight: 550;
          font-size: 0.9rem;
          color: ${theme.text};
          line-height: 1.3;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }

        .provider-badge {
          font-size: 0.75rem;
          font-weight: 550;
          padding: 2px ${theme.space[2]};
          border-radius: ${theme.space[1]};
          border: 1px solid;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .model-description {
          font-size: 0.8125rem;
          color: ${theme.textSecondary};
          line-height: 1.4;
          margin-top: ${theme.space[1]};
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .model-indicators {
          display: flex;
          align-items: flex-start;
          gap: ${theme.space[2]};
          flex-shrink: 0;
          margin-top: 2px;
        }

        .vision-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}08 100%);
          color: ${theme.primary};
          font-size: 0.75rem;
          font-weight: 520;
          padding: 4px ${theme.space[2]};
          border-radius: ${theme.space[1]};
          border: 1px solid ${theme.primary}25;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .check-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${theme.primary};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px ${theme.primary}30;
          transition: all 0.2s ease;
        }

        /* 悬浮和选中状态 */
        .model-option:hover .provider-badge {
          transform: scale(1.05);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .model-option:hover .vision-badge {
          background: linear-gradient(135deg, ${theme.primary}20 0%, ${theme.primary}15 100%);
          border-color: ${theme.primary}40;
          transform: scale(1.05);
        }

        .model-option:hover .check-indicator {
          transform: scale(1.1);
          box-shadow: 0 4px 8px ${theme.primary}40;
        }

        /* 高亮状态 */
        .dropdown-option.highlighted .model-option {
          background: ${theme.backgroundHover};
          margin: 0 -${theme.space[3]};
          padding: ${theme.space[3]};
          border-radius: ${theme.space[2]};
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .model-option {
            flex-direction: column;
            align-items: stretch;
            gap: ${theme.space[2]};
          }

          .model-name-row {
            justify-content: space-between;
          }

          .model-indicators {
            align-self: flex-end;
          }

          .provider-badge {
            order: -1;
          }
        }

        @media (max-width: 480px) {
          .model-name {
            font-size: 0.875rem;
          }

          .model-description {
            -webkit-line-clamp: 1;
          }

          .provider-badge {
            font-size: 0.7rem;
            padding: 1px 6px;
          }

          .vision-badge {
            font-size: 0.7rem;
            padding: 2px 6px;
          }
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .model-option,
          .provider-badge,
          .vision-badge,
          .check-indicator {
            transition: none;
          }

          .model-option:hover .provider-badge,
          .model-option:hover .vision-badge,
          .model-option:hover .check-indicator {
            transform: none;
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .provider-badge,
          .vision-badge {
            border-width: 2px;
          }

          .check-indicator {
            border: 2px solid white;
          }
        }
      `}</style>
    </>
  );
};

export default AllModelsSelector;
