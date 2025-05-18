// ai/llm/AllModelsSelector.tsx
import React from "react";
import { Dropdown } from "web/form/Dropdown";
import { CheckIcon } from "@primer/octicons-react";
import type { Model } from "./types";

// 导入所有提供商的模型
import { deepinfraModels } from "integrations/deepinfra/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { googleModels } from "integrations/google/models";
import { mistralModels } from "integrations/mistral/models";
import { openAIModels } from "integrations/openai/models";
import { ollamaModels } from "integrations/ollama/models";
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

// 定义一个带有提供商信息的模型类型
interface ModelWithProvider extends Model {
  provider: string;
}

// 合并所有模型并添加提供商信息
const ALL_MODELS: ModelWithProvider[] = [
  ...deepinfraModels.map((m) => ({ ...m, provider: "deepinfra" })),
  ...deepSeekModels.map((m) => ({ ...m, provider: "deepseek" })),
  ...fireworksmodels.map((m) => ({ ...m, provider: "fireworks" })),
  ...googleModels.map((m) => ({ ...m, provider: "google" })),
  ...mistralModels.map((m) => ({ ...m, provider: "mistral" })),
  ...openAIModels.map((m) => ({ ...m, provider: "openai" })),
  ...ollamaModels.map((m) => ({ ...m, provider: "ollama" })),
  ...sambanovaModels.map((m) => ({ ...m, provider: "sambanova" })),
  ...openrouterModels.map((m) => ({ ...m, provider: "openrouter" })),
  ...xaiModels.map((m) => ({ ...m, provider: "xai" })),
];

const AllModelsSelector: React.FC<AllModelsSelectorProps> = ({
  watch,
  setValue,
  register,
  defaultModel,
  t,
}) => {
  return (
    <>
      <Dropdown
        items={ALL_MODELS}
        selectedItem={ALL_MODELS.find((m) => watch("model") === m.name) || null}
        onChange={(item) => {
          if (item) {
            setValue("model", item.name);
            setValue("provider", item.provider); // 自动设置对应的提供商
          } else {
            setValue("model", "");
            setValue("provider", "");
          }
        }}
        labelField="name"
        valueField="name"
        placeholder={t("selectModel")}
        renderOptionContent={(item, isHighlighted, isSelected) => (
          <div className="model-option">
            <div className="model-info">
              <span className="model-name">{item.name}</span>
              <span className="provider-name">({item.provider})</span>
            </div>
            <div className="model-indicators">
              {item.hasVision && (
                <span className="vision-badge">{t("supportsVision")}</span>
              )}
              {isSelected && <CheckIcon size={16} className="check-icon" />}
            </div>
          </div>
        )}
      />
      <style>{`
        .model-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }
        .model-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .model-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .provider-name {
          font-size: 11px;
          color: #6a737d;
          white-space: nowrap;
        }
        .model-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .vision-badge {
          background: #eaf5ff;
          color: #0366d6;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .check-icon {
          color: #0366d6;
        }
      `}</style>
    </>
  );
};

export default AllModelsSelector;
