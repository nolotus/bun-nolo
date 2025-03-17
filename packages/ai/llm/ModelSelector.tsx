// ai/llm/modelSelector.tsx
import React from "react";
import { Dropdown } from "web/form/Dropdown"; // 更新引入组件
import { CheckIcon } from "@primer/octicons-react";
import type { Model } from "./types";

interface ModelSelectorProps {
  models: Model[];
  watch: (name: string) => any;
  setValue: (name: string, value: any) => void;
  register: any;
  defaultModel: string;
  t: (key: string) => string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  watch,
  setValue,
  register,
  defaultModel,
  t,
}) => {
  return (
    <>
      <Dropdown // 使用新的Dropdown组件
        items={models}
        selectedItem={models.find((m) => watch("model") === m.name) || null}
        onChange={(item) => setValue("model", item?.name || "")}
        labelField="name"
        valueField="name"
        placeholder={t("selectModel")}
        renderOptionContent={(item, isHighlighted, isSelected) => (
          <div className="model-option">
            <span>{item.name}</span>
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
        .model-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
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

export default ModelSelector;
