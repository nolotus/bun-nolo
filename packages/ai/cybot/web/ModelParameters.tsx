import React, { useCallback } from "react";
import { MdRefresh, MdInfoOutline } from "react-icons/md";
import Button from "render/web/ui/Button";
import { Slider } from "web/form/Slider";
import { Tooltip } from "render/web/ui/Tooltip";
import RadioGroup from "render/web/form/RadioGroup";
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  DEFAULT_FREQUENCY_PENALTY,
  DEFAULT_PRESENCE_PENALTY,
  DEFAULT_MAX_TOKENS,
  DEFAULT_REASONING_EFFORT, // 确保导入 reasoning_effort 的默认值
} from "../common/createCybotSchema";

// 定义模型参数的配置，包含默认值和UI展示信息
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
    key: "topP", // 注意：这里的 key 对应 t 函数的翻译键和方便理解，formKey 才是实际的字段名
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
    default: DEFAULT_REASONING_EFFORT, // 确保这里使用导入的默认值
  },
];

// 将配置的 key 映射到实际的 react-hook-form 字段名 (snake_case)
const PARAMETER_FORM_KEYS = {
  temperature: "temperature",
  topP: "top_p", // 这里的映射确保一致性
  frequencyPenalty: "frequency_penalty",
  presencePenalty: "presence_penalty",
  maxTokens: "max_tokens",
  reasoning_effort: "reasoning_effort",
};

const ModelParameters = ({ register, watch, setValue, t, theme }) => {
  // 重置参数为默认值
  const handleResetParameters = useCallback(() => {
    PARAMETER_CONFIGS.forEach((config) => {
      const formKey = PARAMETER_FORM_KEYS[config.key];
      // 仅使用 setValue 来更新表单字段的值
      // `shouldDirty: true` 确保表单状态被正确标记为“脏”
      setValue(formKey, config.default, { shouldDirty: true });
      // ！！重要：不再在这里调用 `register`。`register` 仅用于初始注册字段。
    });
  }, [setValue]); // 依赖中只需要 setValue

  return (
    <div className="model-parameters">
      <div className="parameters-header">
        <h3>{t("modelParameters")}</h3>
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

          // 获取 react-hook-form 中该字段的当前值
          // ！！关键：不再使用 `?? config.default` 来强制回退。
          // 如果字段在 form 中没有被设置，`watch(formKey)` 会返回 undefined。
          const valueFromForm = watch(formKey);

          // 为 UI 组件确保一个非 null/undefined 的值。
          // 这是为了 UI 显示目的，不改变 `react-hook-form` 内部的实际状态。
          let displayValue = valueFromForm;
          if (displayValue === null || displayValue === undefined) {
            displayValue = config.default;
          }

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
                    value={displayValue} // 使用安全的 displayValue
                    name={formKey} // 对于 RadioGroup，name 属性也很重要
                    // 当 RadioGroup 值改变时，更新 react-hook-form 状态
                    onChange={(newValue) =>
                      setValue(formKey, newValue, { shouldDirty: true })
                    }
                  />
                ) : (
                  // 对于 Slider，它是一个受控组件
                  <>
                    <Slider
                      value={displayValue} // 使用安全的 displayValue
                      // 当 Slider 值改变时，更新 react-hook-form 状态
                      onChange={(newValue) =>
                        setValue(formKey, newValue, { shouldDirty: true })
                      }
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
                        {config.format(displayValue)}{" "}
                        {/* 格式化 displayValue */}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelParameters;
