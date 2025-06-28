// features/ai/llm/AllModelsSelector.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { Dropdown } from "render/web/ui/Dropdown";
import { CheckIcon, EyeIcon } from "@primer/octicons-react";

// 1. [关键] 从新的数据文件中导入模型数据和类型
import { ALL_MODELS, type ModelWithProvider } from "./models";

// Props 接口保持不变
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
  const theme = useTheme();

  // 内部逻辑保持不变，依然简洁
  const selectedItem = ALL_MODELS.find((m) => m.name === value) || null;

  // 2. [移除] 所有模型数据和类型定义都已移出此文件

  return (
    <>
      <style href="model-selector" precedence="medium">{`
        /* 样式保持不变，这里省略以保持简洁 */
    .model-selector-container {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
          width: 100%;
        }

        .model-selector-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: ${error ? theme.error : theme.text};
          margin-bottom: ${theme.space[1]};
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .model-option {
          display: flex;
          align-items: center;
          gap: ${theme.space[3]};
          padding: ${theme.space[3]} ${theme.space[1]};
          min-height: 44px;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        /* 学习 Input 的新拟物风格 */
        .model-option::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}06 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .model-option:hover::before {
          opacity: 1;
        }

        .model-main-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
        }

        .model-name {
          font-weight: 550;
          font-size: 0.925rem;
          color: ${theme.text};
          line-height: 1.3;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
        }

        .model-provider-row {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          flex-wrap: wrap;
        }

        /* 学习 Input 的标签设计 - 新拟物风格 */
        .provider-badge {
          font-size: 0.75rem;
          font-weight: 520;
          color: ${theme.textTertiary};
          background: ${theme.backgroundTertiary};
          border: 1px solid ${theme.borderLight};
          padding: 3px ${theme.space[2]};
          border-radius: ${theme.space[2]};
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 
            0 1px 3px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* Vision 标签 - 学习 Input 的主色调处理 */
        .vision-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}08 100%);
          color: ${theme.primary};
          font-size: 0.75rem;
          font-weight: 550;
          padding: 3px ${theme.space[2]};
          border-radius: ${theme.space[2]};
          border: 1px solid ${theme.primary}25;
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 
            0 1px 3px ${theme.primary}20,
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .model-indicators {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          flex-shrink: 0;
        }

        .check-icon {
          color: ${theme.primary};
          flex-shrink: 0;
          opacity: 0.9;
          transition: all 0.3s ease;
        }

        .model-helper {
          font-size: 0.8125rem;
          line-height: 1.4;
          margin-top: ${theme.space[1]};
          letter-spacing: -0.01em;
          color: ${error ? theme.error : theme.textTertiary};
        }

        /* 尺寸系统 - 学习 Input 的尺寸逻辑 */
        .model-selector-container.size-small .model-option {
          min-height: 36px;
          padding: ${theme.space[2]} ${theme.space[1]};
        }

        .model-selector-container.size-small .model-name {
          font-size: 0.875rem;
        }

        .model-selector-container.size-small .provider-badge,
        .model-selector-container.size-small .vision-badge {
          font-size: 0.6875rem;
          padding: 2px 6px;
          border-radius: ${theme.space[1]};
        }

        .model-selector-container.size-large .model-option {
          min-height: 48px;
          padding: ${theme.space[3]} ${theme.space[2]};
        }

        .model-selector-container.size-large .model-name {
          font-size: 1rem;
        }

        .model-selector-container.size-large .provider-badge,
        .model-selector-container.size-large .vision-badge {
          font-size: 0.8125rem;
          padding: 4px ${theme.space[3]};
          border-radius: ${theme.space[3]};
        }

        /* 悬浮状态 - 学习 Input 的交互效果 */
        .model-option:hover .provider-badge {
          background: ${theme.backgroundSelected || theme.backgroundHover};
          border-color: ${theme.border};
          color: ${theme.textSecondary};
          transform: translateY(-1px);
          box-shadow: 
            0 2px 6px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .model-option:hover .vision-badge {
          background: linear-gradient(135deg, ${theme.primary}20 0%, ${theme.primary}12 100%);
          border-color: ${theme.primary}35;
          transform: translateY(-1px);
          box-shadow: 
            0 4px 12px ${theme.primary}25,
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .model-option:hover .model-name {
          color: ${theme.primary};
        }

        .model-option:hover .check-icon {
          transform: scale(1.1);
        }

        /* 选中状态 - 学习 Input 的主色调状态 */
        .dropdown-option.selected .model-name {
          color: ${theme.primary};
          font-weight: 600;
        }

        .dropdown-option.selected .provider-badge {
          background: linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}08 100%);
          border-color: ${theme.primary}30;
          color: ${theme.primary};
          box-shadow: 
            0 2px 6px ${theme.primary}20,
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* 错误状态 */
        .model-selector-container.error .provider-badge {
          border-color: ${theme.error}30;
        }

        .model-selector-container.error .vision-badge {
          border-color: ${theme.error}25;
        }

        /* 响应式设计 */
        @media (max-width: 480px) {
          .model-option {
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.space[2]};
            padding: ${theme.space[3]} ${theme.space[1]};
          }

          .model-main-content {
            width: 100%;
          }

          .model-provider-row {
            justify-content: space-between;
            width: 100%;
          }

          .model-indicators {
            margin-left: auto;
          }

          .provider-badge,
          .vision-badge {
            border-radius: ${theme.space[2]};
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .provider-badge,
          .vision-badge {
            border-width: 2px;
          }
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .model-option,
          .provider-badge,
          .vision-badge,
          .model-name,
          .check-icon {
            transition: color 0.1s ease, border-color 0.1s ease;
          }
          
          .model-option:hover .provider-badge,
          .model-option:hover .vision-badge {
            transform: none;
          }
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
              <div className="model-main-content">
                <div className="model-name">{item.name}</div>
                <div className="model-provider-row">
                  <span className="provider-badge">{item.provider}</span>
                  {item.hasVision && (
                    <div className="vision-badge">
                      <EyeIcon size={11} />
                      <span>{t("vision", "Vision")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="model-indicators">
                {isSelected && <CheckIcon size={16} className="check-icon" />}
              </div>
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
