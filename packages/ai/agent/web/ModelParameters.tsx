// features/agent/tabs/ModelParameters.tsx (替换原文件)

import React, { useCallback } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MdRefresh, MdInfoOutline } from "react-icons/md";
import { FormField } from "render/web/form/FormField";
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
} from "../createAgentSchema";

// 1. [封装] 常量现在是组件的内部细节，无需导出
const PARAMETER_CONFIGS = [
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

const PARAMETER_FORM_KEYS = {
  temperature: "temperature",
  topP: "top_p",
  frequencyPenalty: "frequency_penalty",
  presencePenalty: "presence_penalty",
  maxTokens: "max_tokens",
  reasoning_effort: "reasoning_effort",
};

// 2. [简化API] 组件现在只接收 control 和 setValue
const ModelParameters = ({ control, setValue }) => {
  const { t } = useTranslation("ai");

  const handleResetParameters = useCallback(() => {
    PARAMETER_CONFIGS.forEach((config) => {
      const formKey = PARAMETER_FORM_KEYS[config.key];
      setValue(formKey, config.default, { shouldDirty: true });
    });
  }, [setValue]);

  return (
    <div className="model-parameters">
      <div className="parameters-header">
        <h3>{t("form.modelParameters")}</h3>
        <Button
          variant="ghost"
          size="small"
          icon={<MdRefresh size={16} />}
          onClick={handleResetParameters}
          type="button"
        >
          {t("resetToDefaults")}
        </Button>
      </div>

      <div className="parameters-grid">
        {PARAMETER_CONFIGS.map((config) => {
          const formKey = PARAMETER_FORM_KEYS[config.key];

          return (
            // 3. [重构] 每个参数都由自己的 Controller 管理
            <Controller
              key={formKey}
              name={formKey}
              control={control}
              defaultValue={config.default}
              render={({ field }) => {
                const displayValue = field.value ?? config.default;

                return (
                  <FormField
                    horizontal={false} // 使用垂直布局更适合这种UI
                    label={
                      <div className="parameter-label-content">
                        <span>{t(`form.${config.key}`)}</span>
                        <Tooltip
                          content={t(`help.${config.key}`)}
                          placement="right"
                          delay={200}
                        >
                          <MdInfoOutline size={16} className="info-icon" />
                        </Tooltip>
                      </div>
                    }
                  >
                    {config.key === "reasoning_effort" ? (
                      <RadioGroup
                        options={config.options.map((option) => ({
                          id: option,
                          value: option,
                          label: t(option, { defaultValue: option }),
                        }))}
                        value={displayValue}
                        name={field.name}
                        onChange={field.onChange}
                      />
                    ) : (
                      <div className="slider-wrapper">
                        <Slider
                          value={[displayValue]} // Slider通常需要一个数组
                          onValueChange={(val) => field.onChange(val[0])} // 从数组中取出值
                          min={config.min}
                          max={config.max}
                          step={config.step}
                          aria-label={t(`form.${config.key}`)}
                        />
                        <div className="parameter-info">
                          <span className="parameter-range">
                            {config.min} - {config.max}
                          </span>
                          <span className="parameter-current">
                            {config.format(displayValue)}
                          </span>
                        </div>
                      </div>
                    )}
                  </FormField>
                );
              }}
            />
          );
        })}
      </div>

      {/* 样式部分可以保持不变，或根据需要微调 */}
      <style jsx>{`
        .model-parameters {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color, #e2e8f0);
        }
        .parameters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .parameters-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }
        .parameters-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        /* 将 FormField 的 label 和 control 放在同一行 */
        :global(.parameters-grid .form-field) {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 16px;
          align-items: start;
        }
        .parameter-label-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 4px;
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
        .slider-wrapper,
        .parameter-control {
          /* 合并样式 */
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
          font-family: "SF Mono", Consolas, "Roboto Mono", monospace;
        }
        @media (max-width: 640px) {
          :global(.parameters-grid .form-field) {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .parameter-label-content {
            padding-top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelParameters;
