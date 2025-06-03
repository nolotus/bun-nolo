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
} from "../common/createCybotSchema";

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
    default: "medium",
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

const ModelParameters = ({ register, watch, setValue, t, theme }) => {
  const handleResetParameters = useCallback(() => {
    PARAMETER_CONFIGS.forEach((config) => {
      const formKey = PARAMETER_FORM_KEYS[config.key];
      setValue(formKey, config.default);
      register(formKey, { value: config.default });
    });
  }, [setValue, register]);

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
          const value = watch(formKey) ?? config.default;

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
                    value={value}
                    name={formKey}
                    onChange={(newValue) => setValue(formKey, newValue)}
                  />
                ) : (
                  <>
                    <Slider
                      value={value}
                      onChange={(newValue) => setValue(formKey, newValue)}
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
                        {config.format(value)}
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
