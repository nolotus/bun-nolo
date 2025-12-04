// src/components/AllModelsSelector.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import Combobox from "render/web/ui/Combobox";
import { LuImage, LuCheck } from "react-icons/lu";
import { ALL_MODELS, type ModelWithProvider } from "./models";

interface AllModelsSelectorProps {
  value: string | null;
  onChange: (item: ModelWithProvider | null) => void;
  label?: string;
  helperText?: string;
  error?: boolean;
  size?: "small" | "medium" | "large";
}

const styles = `
  /* 仅保留列表项内部的内容布局样式 */
  .model-selector__content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    /* 移除所有 padding 和背景色，由 Combobox 统一管理 */
  }

  .model-selector__details {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .model-selector__name {
    font-size: 0.875rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .model-selector__vision-icon {
    color: var(--textSecondary); 
    flex-shrink: 0;
    opacity: 0.6;
  }
  
  /* 当父级 item 被选中或高亮时，调整内部图标颜色 */
  [data-highlighted] .model-selector__vision-icon,
  [data-selected] .model-selector__vision-icon {
    color: var(--primary);
    opacity: 1;
  }

  .model-selector__check-icon {
    color: var(--primary);
    flex-shrink: 0;
    margin-left: auto;
  }
`;

const AllModelsSelector: React.FC<AllModelsSelectorProps> = ({
  value,
  onChange,
  label,
  helperText,
  error = false,
  size = "medium",
}) => {
  const { t } = useTranslation("ai");

  const selectedItem = ALL_MODELS.find((model) => model.name === value) ?? null;

  return (
    <>
      <style>{styles}</style>

      {/* 
         直接将 layout 属性 (label, error, helperText) 传给 Combobox，
         让它渲染统一的 Field 结构
      */}
      <Combobox
        items={ALL_MODELS}
        selectedItem={selectedItem}
        onChange={onChange}
        labelField="name"
        valueField="name"
        // 样式与文案
        placeholder={t("form.selectModel")}
        label={label}
        helperText={helperText}
        error={error}
        size={size}
        // 功能开关
        searchable
        clearable
        // 自定义渲染选项内容
        renderOptionContent={(item, isHighlighted, isSelected) => (
          <div className="model-selector__content">
            <div className="model-selector__details">
              <span className="model-selector__name">{item.name}</span>

              {/* 视觉模型图标 */}
              {item.hasVision && (
                <LuImage
                  size={14}
                  className="model-selector__vision-icon"
                  title="Vision Supported"
                />
              )}
            </div>

            {/* 选中打勾图标 */}
            {isSelected && (
              <LuCheck size={16} className="model-selector__check-icon" />
            )}
          </div>
        )}
      />
    </>
  );
};

export default AllModelsSelector;
