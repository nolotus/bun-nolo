import React, { useCallback } from "react";
import { Controller } from "react-hook-form";
import { FormField } from "web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { Input } from "web/form/Input";
import { PasswordInput } from "web/form/Input";
import ModelParameters from "./ModelParameters";

// 为了重置逻辑，从 ModelParameters 导入配置，避免 props drilling
// (假设 PARAMETER_CONFIGS 和 PARAMETER_FORM_KEYS 从 ModelParameters.jsx 文件中导出)
import { PARAMETER_CONFIGS, PARAMETER_FORM_KEYS } from "./ModelParameters";

const AdvancedSettingsTab = ({
  t,
  errors,
  control,
  watch,
  setValue, // 接收并使用正确的 setValue 函数
  initialValues = {},
  provider,
  apiSource,
  setApiSource,
  isOllama,
  isProxyDisabled,
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };
  const useServerProxy = watch("useServerProxy");

  // 重置逻辑现在放在这里，它使用 setValue 来实现
  const handleResetParameters = useCallback(() => {
    PARAMETER_CONFIGS.forEach((config) => {
      const formKey = PARAMETER_FORM_KEYS[config.key];
      setValue(formKey, config.default, { shouldDirty: true });
    });
  }, [setValue]);

  // 使用 watch() 获取所有表单值。这比多次调用 watch("key") 更高效。
  const allFormValues = watch();

  return (
    <div className="tab-content-wrapper">
      {/* API 来源 */}
      <FormField
        label={t("apiSource")}
        help={
          apiSource === "platform" ? t("platformApiHelp") : t("customApiHelp")
        }
        {...commonProps}
      >
        <ToggleSwitch
          checked={apiSource === "custom"}
          onChange={(checked) => setApiSource(checked ? "custom" : "platform")}
          disabled={isOllama}
          label={t(apiSource === "custom" ? "useCustomApi" : "usePlatformApi")}
        />
      </FormField>

      {/* 自定义 Provider URL */}
      {(provider === "Custom" || apiSource === "custom") && (
        <FormField
          label={t("providerUrl")}
          error={errors.customProviderUrl?.message}
          help={t("providerUrlHelp")}
          {...commonProps}
        >
          <Controller
            name="customProviderUrl"
            control={control}
            defaultValue={initialValues.customProviderUrl || ""}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t("enterProviderUrl")}
                type="url"
              />
            )}
          />
        </FormField>
      )}

      {/* API Key */}
      {apiSource === "custom" && !isOllama && (
        <FormField
          label={t("apiKeyField")}
          required={!isOllama && !useServerProxy}
          error={errors.apiKey?.message}
          help={t("apiKeyHelp")}
          {...commonProps}
        >
          <Controller
            name="apiKey"
            control={control}
            defaultValue={initialValues.apiKey || ""}
            render={({ field }) => (
              <PasswordInput {...field} placeholder={t("enterApiKey")} />
            )}
          />
        </FormField>
      )}

      {/* Server Proxy 切换 */}
      <FormField
        label={t("useServerProxy")}
        help={
          isProxyDisabled ? t("proxyNotAvailableForProvider") : t("proxyHelp")
        }
        {...commonProps}
      >
        <Controller
          name="useServerProxy"
          control={control}
          defaultValue={initialValues.useServerProxy ?? true}
          render={({ field }) => (
            <ToggleSwitch
              checked={field.value}
              onChange={field.onChange}
              disabled={isProxyDisabled || apiSource === "platform"}
            />
          )}
        />
      </FormField>

      {/* 模型参数 (适配层) */}
      <ModelParameters
        t={t}
        // `values` prop: 传入所有表单值
        values={allFormValues}
        // `onValueChange` prop: 当参数变化时，调用 setValue 更新表单状态
        onValueChange={(key, newValue) =>
          setValue(key, newValue, { shouldDirty: true })
        }
        // `onReset` prop: 传入上面定义的重置函数
        onReset={handleResetParameters}
      />
    </div>
  );
};

export default AdvancedSettingsTab;
