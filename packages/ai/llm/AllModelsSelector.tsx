// src/components/AllModelsSelector.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "render/web/ui/Dropdown";
// [更新] 引入 LuImage 替代 LuEye
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

const AllModelsSelector: React.FC<AllModelsSelectorProps> = ({
  value,
  onChange,
  label,
  helperText,
  error = false,
  size = "medium",
}) => {
  const { t } = useTranslation("ai");

  const selectedItem = ALL_MODELS.find((m) => m.name === value) || null;

  return (
    <>
      <style href="model-selector" precedence="medium">{`
        .model-selector-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          width: 100%;
        }

        .model-selector-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: var(--text);
          margin-bottom: var(--space-1);
        }

        .model-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0 var(--space-1);
          min-height: 40px;
          width: 100%;
          transition: all 0.2s ease-in-out;
          position: relative;
          overflow: hidden;
        }
        
        .model-details {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          min-width: 0;
        }

        .model-name {
          font-weight: 550;
          font-size: 0.9rem;
          color: var(--text);
          transition: color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .provider-badge {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--textTertiary);
          background: var(--backgroundTertiary);
          padding: 2px 6px;
          border-radius: var(--space-1);
          white-space: nowrap;
          text-transform: uppercase;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        
        .vision-icon {
          color: var(--primary);
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .check-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-left: auto;
          transition: transform 0.2s ease;
        }

        .model-helper {
          font-size: 0.8125rem;
          line-height: 1.4;
          margin-top: var(--space-1);
          color: var(--textTertiary);
        }
        
        /* --- 交互状态 --- */
        .model-option:hover {
          background-color: var(--backgroundHover);
        }

        .model-option:hover .model-name {
          color: var(--primary);
        }

        .model-option:hover .provider-badge {
          background: var(--backgroundSelected);
          color: var(--textSecondary);
        }
        
        .model-option:hover .vision-icon {
          opacity: 1;
        }

        .model-option:hover .check-icon {
          transform: scale(1.1);
        }

        .dropdown-item.selected .model-name {
          color: var(--primary);
          font-weight: 600;
        }

        /* --- 错误状态 --- */
        .model-selector-container.error .model-selector-label,
        .model-selector-container.error .model-helper {
          color: var(--error);
        }
      `}</style>

      <div
        className={`model-selector-container size-${size} ${error ? "error" : ""}`}
      >
        {label && <label className="model-selector-label">{label}</label>}

        <Dropdown
          items={ALL_MODELS}
          selectedItem={selectedItem}
          onChange={onChange}
          labelField="name"
          valueField="name"
          placeholder={t("form.selectModel")}
          error={error}
          size={size}
          renderOptionContent={(item, isHighlighted, isSelected) => (
            <div className="model-option">
              <div className="model-details">
                <span className="model-name">{item.name}</span>
                <span className="provider-badge">{item.provider}</span>
                {/* [更新] 使用 LuImage 并微调大小 */}
                {item.hasVision && (
                  <LuImage size={15} className="vision-icon" />
                )}
              </div>
              {isSelected && <LuCheck size={16} className="check-icon" />}
            </div>
          )}
        />
        {helperText && (
          <div className="model-helper" role={error ? "alert" : "note"}>
            {helperText}
          </div>
        )}
      </div>
    </>
  );
};

export default AllModelsSelector;
