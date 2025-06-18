import React from "react";
import { FormField } from "web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { Input } from "web/form/Input";
import PasswordInput from "web/form/PasswordInput";
import ModelParameters from "./ModelParameters";
import { Controller } from "react-hook-form";

const AdvancedSettingsTab = ({
  t,
  errors,
  control,
  watch,
  initialValues = {},
  provider,
  apiSource,
  setApiSource,
  isOllama,
  isProxyDisabled,
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };
  const useServerProxy = watch("useServerProxy");

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

      {/* 模型参数 */}
      <ModelParameters
        register={control.register}
        watch={watch}
        setValue={control.setValue}
        t={t}
        theme={undefined}
      />
    </div>
  );
};

export default AdvancedSettingsTab;
