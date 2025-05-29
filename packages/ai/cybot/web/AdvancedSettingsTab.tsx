import React from "react";
import { FormField } from "web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { Input } from "web/form/Input";
import PasswordInput from "web/form/PasswordInput";
import ModelParameters from "./ModelParameters";

const AdvancedSettingsTab = ({
  t,
  errors,
  register,
  setValue,
  theme,
  watch,
  provider,
  apiSource,
  setApiSource,
  useServerProxy,
  isOllama,
  isProxyDisabled,
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };
  const isCustomProvider = provider === "Custom";

  return (
    <div className="tab-content-wrapper">
      <div className="api-settings-group">
        <FormField
          label={t("apiSource")}
          help={
            apiSource === "platform" ? t("platformApiHelp") : t("customApiHelp")
          }
          {...commonProps}
        >
          <ToggleSwitch
            checked={apiSource === "custom"}
            onChange={(checked) =>
              setApiSource(checked ? "custom" : "platform")
            }
            disabled={isOllama}
            label={t(
              apiSource === "custom" ? "useCustomApi" : "usePlatformApi"
            )}
          />
        </FormField>

        {(isCustomProvider || apiSource === "custom") && (
          <FormField
            label={t("providerUrl")}
            error={errors.customProviderUrl?.message}
            help={t("providerUrlHelp")}
            {...commonProps}
          >
            <Input
              {...register("customProviderUrl")}
              placeholder={t("enterProviderUrl")}
              type="url"
            />
          </FormField>
        )}

        {apiSource === "custom" && !isOllama && (
          <FormField
            label={t("apiKeyField")}
            required={!isOllama && !useServerProxy}
            error={errors.apiKey?.message}
            help={t("apiKeyHelp")}
            {...commonProps}
          >
            <PasswordInput
              {...register("apiKey")}
              placeholder={t("enterApiKey")}
            />
          </FormField>
        )}

        <FormField
          label={t("useServerProxy")}
          help={
            isProxyDisabled ? t("proxyNotAvailableForProvider") : t("proxyHelp")
          }
          {...commonProps}
        >
          <ToggleSwitch
            checked={useServerProxy}
            onChange={(checked) => setValue("useServerProxy", checked)}
            disabled={isProxyDisabled || apiSource === "platform"}
          />
        </FormField>
      </div>

      <ModelParameters
        register={register}
        watch={watch}
        setValue={setValue}
        t={t}
        theme={theme}
      />
    </div>
  );
};

export default AdvancedSettingsTab;
