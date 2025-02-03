import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

// types & validations
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
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { SyncIcon, CheckIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import ToolSelector from "../../tools/ToolSelector";
import { Combobox } from "web/form/Combobox";

type ApiSource = "platform" | "custom";

interface EditCybotProps {
  initialValues: {
    name: string;
    prompt: string;
    provider: string;
    model: string;
    apiKey?: string;
    useServerProxy: boolean;
    isPublic: boolean;
    greeting?: string;
    introduction?: string;
    tools?: string[];
    customProviderUrl?: string;
    inputPrice?: number;
    outputPrice?: number;
  };
  onClose: () => void;
}

const getOrderedProviderOptions = () => {
  return [
    { name: "custom" },
    ...providerOptions.map((item) => ({ name: item })),
  ];
};

const EditCybot: React.FC<EditCybotProps> = ({ initialValues, onClose }) => {
  const { t } = useTranslation("ai");
  const theme = useTheme();

  const {
    form: {
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
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
  const [providerInputValue, setProviderInputValue] = useState(provider || "");

  const isCustomProvider = provider === "Custom";
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  // Initialize form with initial values
  useEffect(() => {
    reset({
      ...initialValues,
      prompt: initialValues.prompt || "",
    });
  }, [initialValues, reset]);

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
      if (modelsList.length > 0 && !watch("model")) {
        setValue("model", modelsList[0].name);
      }
    }
  }, [provider, setValue, isCustomProvider, watch]);

  // Debug logging
  useEffect(() => {
    console.log("Form State:", {
      initialValues,
      currentValues: watch(),
      prompt: watch("prompt"),
      provider: watch("provider"),
      model: watch("model"),
    });
  }, [watch, initialValues]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onClose();
  };

  const promptValue = watch("prompt");

  return (
    <div className="edit-cybot-container">
      <FormTitle>{t("editCybot")}</FormTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-layout">
          {/* 基础信息与行为设置部分 */}
          <div className="form-section">
            <div className="section-title">{t("basicInfoAndBehavior")}</div>
            <div className="section-content">
              <FormField
                label={t("cybotName")}
                required
                error={errors.name?.message}
                horizontal
                labelWidth="140px"
              >
                <Input
                  {...register("name")}
                  defaultValue={initialValues.name}
                  placeholder={t("enterCybotName")}
                />
              </FormField>

              <FormField
                label={t("prompt")}
                error={errors.prompt?.message}
                help={t("promptHelp")}
                horizontal
                labelWidth="140px"
              >
                <TextArea
                  {...register("prompt")}
                  value={promptValue}
                  onChange={(e) => setValue("prompt", e.target.value)}
                  placeholder={t("enterPrompt")}
                  rows={6}
                />
              </FormField>

              <FormField label={t("tools")} horizontal labelWidth="140px">
                <ToolSelector
                  register={register}
                  defaultValue={initialValues.tools}
                />
              </FormField>
            </div>
          </div>

          {/* 模型配置部分 */}
          <div className="form-section">
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
                labelWidth="140px"
              >
                <ToggleSwitch
                  checked={apiSource === "custom"}
                  onChange={(checked) => {
                    setApiSource(checked ? "custom" : "platform");
                    if (!checked) {
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
                labelWidth="140px"
              >
                <Combobox
                  items={getOrderedProviderOptions()}
                  selectedItem={provider ? { name: provider } : null}
                  onChange={(item) => {
                    const newProvider = item?.name || "";
                    setValue("provider", newProvider);
                    setProviderInputValue(newProvider);
                  }}
                  labelField="name"
                  valueField="name"
                  placeholder={t("selectProvider")}
                  allowInput={true}
                  onInputChange={setProviderInputValue}
                />
              </FormField>

              {(isCustomProvider || apiSource === "custom") && (
                <FormField
                  label={t("providerUrl")}
                  error={errors.customProviderUrl?.message}
                  help={t("providerUrlHelp")}
                  horizontal
                  labelWidth="140px"
                >
                  <Input
                    {...register("customProviderUrl")}
                    defaultValue={initialValues.customProviderUrl}
                    placeholder={t("enterProviderUrl")}
                    type="url"
                  />
                </FormField>
              )}

              <FormField
                label={t("model")}
                required
                error={errors.model?.message}
                horizontal
                labelWidth="140px"
              >
                {isCustomProvider ? (
                  <Input
                    {...register("model")}
                    defaultValue={initialValues.model}
                    placeholder={t("enterModelName")}
                  />
                ) : (
                  <Combobox
                    items={models}
                    selectedItem={
                      models.find((m) => watch("model") === m.name) || null
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
                  labelWidth="140px"
                >
                  <PasswordInput
                    {...register("apiKey")}
                    defaultValue={initialValues.apiKey}
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
                labelWidth="140px"
              >
                <ToggleSwitch
                  checked={useServerProxy}
                  onChange={(checked) => setValue("useServerProxy", checked)}
                  disabled={isProxyDisabled || apiSource === "platform"}
                />
              </FormField>
            </div>
          </div>

          {/* 社区设置部分 */}
          <div className="form-section">
            <div className="section-title">{t("communitySettings")}</div>
            <div className="section-content">
              <FormField
                label={t("shareInCommunity")}
                help={
                  apiSource === "platform"
                    ? t("shareInCommunityHelp")
                    : t("shareInCommunityCustomApiHelp")
                }
                horizontal
                labelWidth="140px"
              >
                <ToggleSwitch
                  checked={isPublic}
                  onChange={(checked) => setValue("isPublic", checked)}
                />
              </FormField>

              {isPublic && (
                <>
                  <FormField
                    label={t("greetingMessage")}
                    error={errors.greeting?.message}
                    help={t("greetingMessageHelp")}
                    horizontal
                    labelWidth="140px"
                  >
                    <TextArea
                      {...register("greeting")}
                      defaultValue={initialValues.greeting}
                      placeholder={t("enterGreetingMessage")}
                    />
                  </FormField>

                  <FormField
                    label={t("selfIntroduction")}
                    error={errors.introduction?.message}
                    help={t("selfIntroductionHelp")}
                    horizontal
                    labelWidth="140px"
                  >
                    <TextArea
                      {...register("introduction")}
                      defaultValue={initialValues.introduction}
                      placeholder={t("enterSelfIntroduction")}
                      rows={4}
                    />
                  </FormField>

                  <FormField label={t("pricing")} horizontal labelWidth="140px">
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
                </>
              )}
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
        /* Layout Constants */
        .edit-cybot-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        /* Form Structure */
        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Section Styling */
        .form-section {
          padding: 20px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: 8px;
        }

        .section-title {
          color: ${theme.textDim};
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${theme.border};
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Model Option & Indicators */
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
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .check-icon {
          color: ${theme.primary};
        }

        /* Price Inputs Grid */
        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .edit-cybot-container {
            padding: 16px;
          }

          .form-section,
          .section-content {
            padding: 16px;
            gap: 12px;
          }

          .section-title {
            font-size: 14px;
            margin-bottom: 16px;
          }

          .price-inputs {
            grid-template-columns: 1fr;
          }

          :global(.form-field.horizontal) {
            flex-direction: column;
            gap: 8px;
          }

          :global(.form-field.horizontal .form-label) {
            width: 100% !important;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default EditCybot;
