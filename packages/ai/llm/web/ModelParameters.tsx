import React from "react";
import { MdRefresh, MdInfoOutline } from "react-icons/md";
import Button from "render/web/ui/Button";
import { Slider } from "render/web/form/Slider";
import { Tooltip } from "render/web/ui/Tooltip";
import RadioGroup from "render/web/form/RadioGroup";
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  DEFAULT_FREQUENCY_PENALTY,
  DEFAULT_PRESENCE_PENALTY,
  DEFAULT_MAX_TOKENS,
  DEFAULT_REASONING_EFFORT,
} from "../common/createAgentSchema";
import { useTranslation } from "react-i18next";

// 导出常量，供 AdvancedSettingsTab 使用
export const PARAMETER_CONFIGS = [
  {
    key: "temperature",
    min: 0,
    max: 2,
    step: 0.1,
    default: DEFAULT_TEMPERATURE,
    format: (val) => val.toFixed(1),
  },
  {
    key: "topP",
    min: 0,
    max: 1,
    step: 0.1,
    default: DEFAULT_TOP_P,
    format: (val) => val.toFixed(1),
  },
  {
    key: "frequencyPenalty",
    min: -2,
    max: 2,
    step: 0.1,
    default: DEFAULT_FREQUENCY_PENALTY,
    format: (val) => val.toFixed(1),
  },
  {
    key: "presencePenalty",
    min: -2,
    max: 2,
    step: 0.1,
    default: DEFAULT_PRESENCE_PENALTY,
    format: (val) => val.toFixed(1),
  },
  {
    key: "maxTokens",
    min: 1,
    max: 16384,
    step: 100,
    default: DEFAULT_MAX_TOKENS,
    format: (val) => val.toString(),
  },
  {
    key: "reasoning_effort",
    options: ["low", "medium", "high"],
    default: DEFAULT_REASONING_EFFORT,
  },
];

export const PARAMETER_FORM_KEYS = {
  temperature: "temperature",
  topP: "top_p",
  frequencyPenalty: "frequency_penalty",
  presencePenalty: "presence_penalty",
  maxTokens: "max_tokens",
  reasoning_effort: "reasoning_effort",
};

// Props 接口已更新为通用的 values, onValueChange, 和 onReset
const ModelParameters = ({ values, onValueChange, onReset }) => {
  const { t } = useTranslation("ai");

  return (
    <div className="model-parameters">
      <div className="parameters-header">
        <h3>{t("modelParameters")}</h3>
        <Button
          variant="ghost"
          size="small"
          icon={<MdRefresh size={16} />}
          onClick={onReset} // 直接使用父组件提供的 onReset 回调
          type="button"
        >
          {t("resetToDefaults")}
        </Button>
      </div>

      <div className="parameters-grid">
        {PARAMETER_CONFIGS.map((config) => {
          const formKey = PARAMETER_FORM_KEYS[config.key];
          // 从 values prop 获取值，如果不存在则使用默认值
          const displayValue = values[formKey] ?? config.default;

          return (
            <div key={config.key} className="parameter-item">
              <div className="parameter-label">
                <span className="label-text">{t(config.key)}</span>
                <Tooltip
                  content={t(`${config.key}Help`)}
                  placement="right"
                  delay={200}
                >
                  <MdInfoOutline size={16} className="info-icon" />
                </Tooltip>
              </div>

              <div className="parameter-control">
                {config.key === "reasoning_effort" ? (
                  <RadioGroup
                    options={config.options.map((option) => ({
                      id: option,
                      value: option,
                      label: t(option) || option,
                    }))}
                    value={displayValue}
                    name={formKey}
                    // 调用通用的 onValueChange 回调，通知父组件值的变更
                    onChange={(newValue) => onValueChange(formKey, newValue)}
                  />
                ) : (
                  <>
                    <Slider
                      value={displayValue}
                      // 调用通用的 onValueChange 回调
                      onChange={(newValue) => onValueChange(formKey, newValue)}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      showValue
                      ariaLabel={t(config.key)}
                    />
                    <div className="parameter-info">
                      <span className="parameter-range">
                        {config.min} - {config.max}
                      </span>
                      <span className="parameter-current">
                        {config.format(displayValue)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style href="model-parameters" precedence="medium">{`
        /* CSS styles remain the same */
        .model-parameters {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border, #e2e8f0);
        }
        .parameters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .parameters-header h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--text, #1f2937);
        }
        .parameters-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .parameter-item {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 16px;
          align-items: start;
          min-height: 60px;
        }
        .parameter-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 4px;
        }
        .label-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--text, #1f2937);
        }
        .info-icon {
          color: var(--text-tertiary, #6b7280);
          cursor: help;
          transition: color 0.15s ease;
          flex-shrink: 0;
        }
        .info-icon:hover {
          color: var(--primary, #3b82f6);
        }
        .parameter-control {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .parameter-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-tertiary, #6b7280);
        }
        .parameter-current {
          font-weight: 500;
          color: var(--primary, #3b82f6);
          font-family: 'SF Mono', Consolas, 'Roboto Mono', monospace;
        }
        @media (max-width: 640px) {
          .parameter-item {
            grid-template-columns: 1fr;
            gap: 12px;
            min-height: auto;
          }
          .parameter-label {
            padding-top: 0;
          }
          .parameters-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelParameters;
