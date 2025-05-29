import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";
import TabsNav from "render/web/ui/TabsNav";
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { PlusIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";
import { NumberInput } from "web/form/NumberInput";
import ReferencesSelector from "./ReferencesSelector";
import ToolSelector from "ai/tools/ToolSelector";
import useModelPricing from "../hooks/useModelPricing";
import { useOllamaSettings } from "../hooks/useOllamaSettings";
import { useProxySetting } from "../hooks/useProxySetting";
import { useCybotValidation } from "../common/useCybotFormValidation";
import BasicInfoTab from "./BasicInfoTab";
import ModelParameters from "./ModelParameters";
import PasswordInput from "web/form/PasswordInput";
import { Input } from "web/form/Input";

const CreateCybot: React.FC = () => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [references, setReferences] = useState([]);
  const [smartReadEnabled, setSmartReadEnabled] = useState(false);

  const space = useAppSelector(selectCurrentSpace);

  const {
    form: {
      register,
      handleSubmit,
      watch,
      setValue,
      control,
      formState: { errors, isSubmitting },
    },
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
  } = useCybotValidation();

  const { apiSource, setApiSource, isOllama } = useOllamaSettings(
    provider,
    setValue
  );
  const isCustomProvider = provider === "Custom";
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  useEffect(() => {
    setValue("references", references);
    setValue("smartReadEnabled", smartReadEnabled);
  }, [references, smartReadEnabled, setValue]);

  const handleReferencesChange = (newReferences) => {
    setReferences(newReferences);
  };

  const tabs = [
    { id: 0, label: t("basicInfo") },
    { id: 1, label: t("references") },
    { id: 2, label: t("toolSelection") },
    { id: 3, label: t("publishSettings") },
    { id: 4, label: t("advancedSettings") },
  ];

  const renderTabContent = () => {
    const commonProps = { horizontal: true, labelWidth: "140px" };

    switch (activeTab) {
      case 0:
        return (
          <BasicInfoTab
            t={t}
            errors={errors}
            register={register}
            control={control}
            watch={watch}
            setValue={setValue}
          />
        );

      case 1:
        return (
          <div className="tab-content-wrapper">
            <FormField
              label={t("smartReadCurrentSpace")}
              help={t("smartReadHelp")}
              {...commonProps}
            >
              <ToggleSwitch
                checked={smartReadEnabled}
                onChange={(checked) => setSmartReadEnabled(checked)}
              />
            </FormField>
            <FormField
              label={t("selectReferences")}
              help={t("selectReferencesHelp")}
              error={errors.references?.message}
              {...commonProps}
            >
              <ReferencesSelector
                space={space}
                references={references}
                onChange={handleReferencesChange}
                t={t}
              />
            </FormField>
          </div>
        );

      case 2:
        return (
          <div className="tab-content-wrapper">
            <FormField
              label={t("selectTools")}
              help={t("selectToolsHelp")}
              error={errors.tools?.message}
              {...commonProps}
            >
              <ToolSelector
                register={register}
                defaultValue={watch("tools") || []}
              />
            </FormField>
          </div>
        );

      case 3:
        return (
          <div className="tab-content-wrapper">
            <FormField
              label={t("shareInCommunity")}
              help={
                apiSource === "platform"
                  ? t("shareInCommunityHelp")
                  : t("shareInCommunityCustomApiHelp")
              }
              {...commonProps}
            >
              <ToggleSwitch
                checked={isPublic}
                onChange={(checked) => setValue("isPublic", checked)}
              />
            </FormField>
            {isPublic && (
              <div className="public-settings-group">
                <FormField
                  label={t("greetingMessage")}
                  error={errors.greeting?.message}
                  help={t("greetingMessageHelp")}
                  {...commonProps}
                >
                  <TextArea
                    {...register("greeting")}
                    placeholder={t("enterGreetingMessage")}
                  />
                </FormField>
                <FormField
                  label={t("selfIntroduction")}
                  error={errors.introduction?.message}
                  help={t("selfIntroductionHelp")}
                  {...commonProps}
                >
                  <TextArea
                    {...register("introduction")}
                    placeholder={t("enterSelfIntroduction")}
                    rows={4}
                  />
                </FormField>
                <FormField label={t("pricing")} {...commonProps}>
                  <div className="price-inputs">
                    <NumberInput
                      value={inputPrice}
                      onChange={setInputPrice}
                      decimal={4}
                      placeholder={t("inputPrice")}
                      aria-label={t("inputPricePerThousand")}
                    />
                    <NumberInput
                      value={outputPrice}
                      onChange={setOutputPrice}
                      decimal={4}
                      placeholder={t("outputPrice")}
                      aria-label={t("outputPricePerThousand")}
                    />
                  </div>
                </FormField>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="tab-content-wrapper">
            <div className="api-settings-group">
              <FormField
                label={t("apiSource")}
                help={
                  apiSource === "platform"
                    ? t("platformApiHelp")
                    : t("customApiHelp")
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
                  isProxyDisabled
                    ? t("proxyNotAvailableForProvider")
                    : t("proxyHelp")
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

      default:
        return null;
    }
  };

  return (
    <div className="create-cybot-container">
      <FormTitle>{t("createCybot")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-header">
          <TabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="form-body">
          <div className="tab-content">{renderTabContent()}</div>
        </div>

        <div className="form-footer">
          <div className="footer-actions">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              icon={<PlusIcon />}
            >
              {isSubmitting ? t("creating") : t("create")}
            </Button>
          </div>
        </div>
      </form>

      <style>{`
        .create-cybot-container {
          max-width: 800px;
          margin: 24px auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .form-header {
          flex-shrink: 0;
        }

        .form-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tab-content-wrapper {
          padding: ${theme.space?.[8] || "32px"} ${theme.space?.[6] || "24px"};
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[8] || "32px"};
        }

        .form-footer {
          flex-shrink: 0;
          padding: ${theme.space?.[6] || "24px"};
          margin-top: ${theme.space?.[4] || "16px"};
        }

        .footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: ${theme.space?.[3] || "12px"};
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${theme.space?.[4] || "16px"};
        }

        .public-settings-group,
        .api-settings-group {
          margin-top: ${theme.space?.[8] || "32px"};
          padding-top: ${theme.space?.[6] || "24px"};
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[6] || "24px"};
        }

        .model-parameters {
          margin-top: ${theme.space?.[12] || "48px"};
          padding-top: ${theme.space?.[8] || "32px"};
        }

        .parameters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: ${theme.space?.[8] || "32px"};
        }

        .parameters-header h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
        }

        .parameters-grid {
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[6] || "24px"};
        }

        .parameter-item {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: ${theme.space?.[4] || "16px"};
          align-items: start;
          min-height: 60px;
        }

        .parameter-label {
          display: flex;
          align-items: center;
          gap: ${theme.space?.[2] || "8px"};
          padding-top: ${theme.space?.[1] || "4px"};
        }

        .label-text {
          font-size: 14px;
          font-weight: 500;
          color: ${theme.text};
        }

        .info-icon {
          color: ${theme.textTertiary};
          cursor: help;
          transition: color 0.15s ease;
          flex-shrink: 0;
        }

        .info-icon:hover {
          color: ${theme.primary};
        }

        .parameter-control {
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[3] || "12px"};
        }

        .parameter-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: ${theme.textTertiary};
        }

        .parameter-current {
          font-weight: 500;
          color: ${theme.primary};
          font-family: 'SF Mono', Consolas, 'Roboto Mono', monospace;
        }

        @media (max-width: 640px) {
          .create-cybot-container {
            padding: 16px;
            margin: 16px auto;
          }

          .tab-content-wrapper {
            padding: ${theme.space?.[6] || "24px"} ${theme.space?.[4] || "16px"};
            gap: ${theme.space?.[6] || "24px"};
          }

          .form-footer {
            padding: ${theme.space?.[4] || "16px"};
          }

          .footer-actions {
            flex-direction: column;
          }

          .price-inputs {
            grid-template-columns: 1fr;
          }

          .parameter-item {
            grid-template-columns: 1fr;
            gap: ${theme.space?.[3] || "12px"};
            min-height: auto;
          }

          .parameter-label {
            padding-top: 0;
          }

          .parameters-header {
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.space?.[4] || "16px"};
          }
        }

        .form-body::-webkit-scrollbar {
          width: 4px;
        }

        .form-body::-webkit-scrollbar-thumb {
          background-color: ${theme.textLight};
          border-radius: 2px;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default CreateCybot;
