// features/agent/tabs/AdvancedSettingsTab.tsx

import React, { useCallback } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input, PasswordInput } from "render/web/form/Input";
import { FormField } from "render/web/form/FormField";
import { Slider } from "render/web/form/Slider"; // Slider 组件本身无需修改
import RadioGroup from "render/web/form/RadioGroup";
import Button from "render/web/ui/Button";
import ToggleSwitch from "web/ui/ToggleSwitch";

import {
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  DEFAULT_FREQUENCY_PENALTY,
  DEFAULT_PRESENCE_PENALTY,
  DEFAULT_REASONING_EFFORT,
} from "../common/createAgentSchema";
import { MdRefresh } from "react-icons/md";

const PARAMETER_CONFIGS = [
  {
    key: "temperature",
    min: 0,
    max: 2,
    step: 0.01,
    default: DEFAULT_TEMPERATURE,
  },
  { key: "topP", min: 0, max: 1, step: 0.01, default: DEFAULT_TOP_P },
  {
    key: "frequencyPenalty",
    min: -2,
    max: 2,
    step: 0.01,
    default: DEFAULT_FREQUENCY_PENALTY,
  },
  {
    key: "presencePenalty",
    min: -2,
    max: 2,
    step: 0.01,
    default: DEFAULT_PRESENCE_PENALTY,
  },
  {
    key: "reasoningEffort",
    options: ["low", "medium", "high"],
    default: DEFAULT_REASONING_EFFORT,
  },
];

const PARAMETER_FORM_KEYS = {
  temperature: "temperature",
  topP: "top_p",
  frequencyPenalty: "frequency_penalty",
  presencePenalty: "presence_penalty",
  reasoningEffort: "reasoning_effort",
};

const AdvancedSettingsTab = ({
  errors,
  control,
  setValue,
  watch,
  provider,
  isOllama,
  isProxyDisabled,
}) => {
  const { t } = useTranslation("ai");
  const commonProps = { horizontal: true, labelWidth: "140px" };

  const apiSource = watch("apiSource");
  const useServerProxy = watch("useServerProxy");

  const handleResetParameters = useCallback(() => {
    PARAMETER_CONFIGS.forEach((config) => {
      const formKey = PARAMETER_FORM_KEYS[config.key];
      setValue(formKey, config.default, { shouldDirty: true });
    });
  }, [setValue]);

  return (
    <div className="tab-content-wrapper">
      {/* --- API 设置部分 (保持不变) --- */}
      <FormField
        label={t("form.apiSource")}
        help={
          apiSource === "platform"
            ? t("help.apiSourcePlatform")
            : t("help.apiSourceCustom")
        }
        {...commonProps}
      >
        <Controller
          name="apiSource"
          control={control}
          render={({ field }) => (
            <ToggleSwitch
              checked={field.value === "custom"}
              onChange={(checked) =>
                field.onChange(checked ? "custom" : "platform")
              }
              disabled={isOllama}
              label={t(
                field.value === "custom"
                  ? "form.useCustomApi"
                  : "form.usePlatformApi"
              )}
            />
          )}
        />
      </FormField>

      {(provider?.toLowerCase() === "custom" || apiSource === "custom") && (
        <FormField
          label={t("form.customProviderUrl")}
          error={errors.customProviderUrl?.message}
          {...commonProps}
        >
          <Controller
            name="customProviderUrl"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t("form.customProviderUrlPlaceholder")}
                type="url"
              />
            )}
          />
        </FormField>
      )}

      {apiSource === "custom" && !isOllama && (
        <FormField
          label={t("form.apiKey")}
          required={!useServerProxy}
          error={errors.apiKey?.message}
          help={t("help.apiKey")}
          {...commonProps}
        >
          <Controller
            name="apiKey"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                placeholder={t("form.apiKeyPlaceholder")}
              />
            )}
          />
        </FormField>
      )}

      <FormField
        label={t("form.useServerProxy")}
        help={
          isProxyDisabled ? t("proxyNotAvailableForProvider") : t("help.proxy")
        }
        {...commonProps}
      >
        <Controller
          name="useServerProxy"
          control={control}
          render={({ field }) => (
            <ToggleSwitch
              checked={field.value}
              onChange={field.onChange}
              disabled={isProxyDisabled || apiSource === "platform"}
            />
          )}
        />
      </FormField>

      {/* --- 模型参数部分 (保持不变) --- */}
      <div className="model-parameters-container">
        <div className="parameters-header">
          <h3 className="parameters-title">{t("form.modelParameters")}</h3>
          <Button
            variant="ghost"
            size="small"
            onClick={handleResetParameters}
            icon={<MdRefresh size={16} />}
          >
            {t("resetToDefaults")}
          </Button>
        </div>

        <div className="parameters-grid">
          {PARAMETER_CONFIGS.map((config) => {
            const formKey = PARAMETER_FORM_KEYS[config.key];
            return (
              <FormField
                key={formKey}
                label={t(`form.${config.key}`)}
                help={t(`help.${config.key}`)}
                horizontal={false}
              >
                <Controller
                  name={formKey}
                  control={control}
                  defaultValue={config.default}
                  render={({ field }) =>
                    config.options ? (
                      <RadioGroup
                        value={field.value}
                        onChange={field.onChange}
                        options={config.options.map((opt) => ({
                          label: opt,
                          value: opt,
                        }))}
                      />
                    ) : (
                      // [已更正] 直接传递 field 属性
                      <Slider
                        value={field.value ?? config.default}
                        onChange={field.onChange}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        showValue // 让Slider自己显示值
                      />
                    )
                  }
                />
              </FormField>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .model-parameters-container {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color, #e2e8f0);
        }
        .parameters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .parameters-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }
        .parameters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
      `}</style>
    </div>
  );
};

export default AdvancedSettingsTab;
