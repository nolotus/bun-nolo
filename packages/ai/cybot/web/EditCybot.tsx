import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

// types
import type { Model } from "../../llm/types";
import { useEditCybotValidation } from "../hooks/useEditCybotValidation";

// data & hooks
import { getModelsByProvider, providerOptions } from "../../llm/providers";
import useModelPricing from "../hooks/useModelPricing";
import { useProxySetting } from "../hooks/useProxySetting";

// components
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { SyncIcon, CheckIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import ToolSelector from "../../tools/ToolSelector";
import { Combobox } from "web/form/Combobox";

type ApiSource = "platform" | "custom";

const getOrderedProviderOptions = () => {
  return [
    { name: "custom" },
    ...providerOptions.map((item) => ({ name: item })),
  ];
};

const EditCybot: React.FC<{
  initialValues: any;
  onClose: () => void;
}> = ({ initialValues, onClose }) => {
  const { t } = useTranslation("ai");
  const theme = useTheme();

  const {
    form: {
      register,
      handleSubmit,
      watch,
      setValue,
      formState: { errors, isSubmitting },
    },
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
  } = useEditCybotValidation(initialValues);

  const [apiSource, setApiSource] = useState<ApiSource>(
    initialValues.apiKey ? "custom" : "platform"
  );
  const [models, setModels] = useState<Model[]>([]);
  const [providerInputValue, setProviderInputValue] = useState<string>(
    provider || ""
  );
  const isCustomProvider = provider === "Custom";

  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  useEffect(() => {
    if (apiSource === "platform") {
      setValue("apiKey", "");
      setValue("useServerProxy", true);
    }
  }, [apiSource, setValue]);

  useEffect(() => {
    setProviderInputValue(provider || "");
    if (!isCustomProvider) {
      setValue("customProviderUrl", "");
      const modelsList = getModelsByProvider(provider || "");
      setModels(modelsList);
      if (modelsList.length > 0) {
        setValue("model", modelsList[0].name);
      }
    }
  }, [provider, setValue, isCustomProvider]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="edit-cybot-container">
      <FormTitle>{t("editCybot")}</FormTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-layout">
          <div className="form-section basic-section">
            <div className="section-title">{t("basicInfoAndBehavior")}</div>
            <div className="section-content">
              <FormField
                label={t("cybotName")}
                required
                error={errors.name?.message}
                horizontal
                labelWidth="120px"
              >
                <Input
                  {...register("name")}
                  placeholder={t("enterCybotName")}
                />
              </FormField>

              <FormField
                label={t("prompt")}
                error={errors.prompt?.message}
                help={t("promptHelp")}
                horizontal
                labelWidth="120px"
              >
                <TextArea
                  {...register("prompt")}
                  placeholder={t("enterPrompt")}
                />
              </FormField>

              <FormField
                label={t("tools")}
                help={t("toolsHelp")}
                horizontal
                labelWidth="120px"
              >
                <ToolSelector register={register} />
              </FormField>
            </div>
          </div>

          <div className="form-section model-section">
            <div className="section-title">{t("modelConfiguration")}</div>
            <div className="section-content">
              <FormField
                label={t("apiSource")}
                help={
                  apiSource === "platform"
                    ? t("platformApiHelp")
                    : t("customApiHelp")
                }
                horizontal
                labelWidth="120px"
              >
                <ToggleSwitch
                  checked={apiSource === "custom"}
                  onChange={(checked) => {
                    const newSource = checked ? "custom" : "platform";
                    setApiSource(newSource);
                    if (newSource === "platform") {
                      setValue("apiKey", "");
                      setValue("useServerProxy", true);
                    }
                  }}
                  label={t(
                    apiSource === "custom" ? "useCustomApi" : "usePlatformApi"
                  )}
                />
              </FormField>

              <FormField
                label={t("provider")}
                required
                error={errors.provider?.message}
                horizontal
                labelWidth="120px"
              >
                <Combobox
                  items={getOrderedProviderOptions()}
                  selectedItem={provider ? { name: provider } : null}
                  onChange={(item) => {
                    const newProvider = item?.name || "";
                    setValue("provider", newProvider);
                    setProviderInputValue(newProvider);
                    if (newProvider !== "Custom") {
                      setValue("customProviderUrl", "");
                      setValue("model", "");
                    }
                  }}
                  labelField="name"
                  valueField="name"
                  placeholder={t("selectProvider")}
                  allowInput={true}
                  onInputChange={(value) => setProviderInputValue(value)}
                />
              </FormField>

              <FormField
                label={t("model")}
                required
                error={errors.model?.message}
                horizontal
                labelWidth="120px"
              >
                {isCustomProvider ? (
                  <Input
                    {...register("model")}
                    placeholder={t("enterModelName")}
                  />
                ) : (
                  <Combobox
                    items={models}
                    selectedItem={
                      models.find((model) => watch("model") === model.name) ||
                      null
                    }
                    onChange={(item) => setValue("model", item?.name || "")}
                    labelField="name"
                    valueField="name"
                    placeholder={t("selectModel")}
                    renderOptionContent={(item, isHighlighted, isSelected) => (
                      <div className="model-option">
                        <span>{item.name}</span>
                        <div className="model-indicators">
                          {item.hasVision && (
                            <span className="vision-badge">
                              {t("supportsVision")}
                            </span>
                          )}
                          {isSelected && (
                            <CheckIcon size={16} className="check-icon" />
                          )}
                        </div>
                      </div>
                    )}
                  />
                )}
              </FormField>

              {apiSource === "custom" && (
                <FormField
                  label={t("apiKey")}
                  required
                  error={errors.apiKey?.message}
                  help={t("apiKeyHelp")}
                  horizontal
                  labelWidth="120px"
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
                horizontal
                labelWidth="120px"
              >
                <ToggleSwitch
                  checked={useServerProxy}
                  onChange={(checked) => setValue("useServerProxy", checked)}
                  disabled={isProxyDisabled || apiSource === "platform"}
                />
              </FormField>
            </div>
          </div>

          <div className="form-section tools-community-section">
            <div className="section-content">
              <div className="community-section">
                <FormField
                  label={t("shareInCommunity")}
                  help={
                    apiSource === "platform"
                      ? t("shareInCommunityHelp")
                      : t("shareInCommunityCustomApiHelp")
                  }
                  horizontal
                  labelWidth="120px"
                >
                  <ToggleSwitch
                    checked={isPublic}
                    onChange={(checked) => setValue("isPublic", checked)}
                  />
                </FormField>

                {isPublic && (
                  <div className="community-fields">
                    <FormField
                      label={t("greetingMessage")}
                      error={errors.greeting?.message}
                      help={t("greetingMessageHelp")}
                      horizontal
                      labelWidth="120px"
                    >
                      <Input
                        {...register("greeting")}
                        placeholder={t("enterGreetingMessage")}
                      />
                    </FormField>

                    <FormField
                      label={t("selfIntroduction")}
                      error={errors.introduction?.message}
                      help={t("selfIntroductionHelp")}
                      horizontal
                      labelWidth="120px"
                    >
                      <TextArea
                        {...register("introduction")}
                        placeholder={t("enterSelfIntroduction")}
                      />
                    </FormField>

                    <div className="price-settings">
                      <FormField
                        label={t("inputPrice")}
                        help={t("inputPriceHelp")}
                        horizontal
                        labelWidth="120px"
                      >
                        <Input
                          type="number"
                          value={inputPrice}
                          onChange={(e) =>
                            setInputPrice(Number(e.target.value))
                          }
                          placeholder="0.00"
                        />
                      </FormField>

                      <FormField
                        label={t("outputPrice")}
                        help={t("outputPriceHelp")}
                        horizontal
                        labelWidth="120px"
                      >
                        <Input
                          type="number"
                          value={outputPrice}
                          onChange={(e) =>
                            setOutputPrice(Number(e.target.value))
                          }
                          placeholder="0.00"
                        />
                      </FormField>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          block
          size="large"
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<SyncIcon />}
        >
          {isSubmitting ? t("updating") : t("update")}
        </Button>
      </form>
      <style jsx>{`
        .edit-cybot-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
        }

        .form-section {
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          padding: 24px;
        }

        .basic-section {
          grid-row: span 2;
          height: calc(100% - 24px);
        }

        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.textDim};
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid ${theme.border};
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .model-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }

        .model-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vision-badge {
          background: ${theme.primaryGhost};
          color: ${theme.primary};
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .community-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .price-settings {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        /* 新增工具选择器样式 */
        :global(.tool-selector) {
          border: 1px solid ${theme.border};
          border-radius: 8px;
          padding: 12px;
          margin-top: 8px;
        }

        :global(.tool-item) {
          padding: 8px 12px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        :global(.tool-item:hover) {
          background: ${theme.backgroundHover};
        }

        @media (max-width: 1024px) {
          .form-layout {
            grid-template-columns: 1fr;
          }

          .basic-section {
            grid-row: auto;
            height: auto;
          }

          .price-settings {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .edit-cybot-container {
            padding: 16px;
          }

          .form-layout {
            gap: 16px;
          }

          .form-section {
            padding: 16px;
          }

          .section-content {
            gap: 16px;
          }

          /* 调整水平表单字段的标签宽度 */
          :global(.form-field.horizontal) {
            align-items: flex-start;
            flex-direction: column;
          }

          :global(.form-field.horizontal .form-label) {
            width: 100% !important;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default EditCybot;
