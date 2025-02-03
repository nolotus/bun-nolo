import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

// types
import type { Model } from "../../llm/types";
import { useCreateCybotValidation } from "../hooks/useCreateCybotValidation";

// data & hooks
import { getModelsByProvider, providerOptions } from "../../llm/providers";
import useModelPricing from "../hooks/useModelPricing";
import { useProxySetting } from "../hooks/useProxySetting";

// web
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { PlusIcon, CheckIcon } from "@primer/octicons-react";
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

const CreateCybot: React.FC = () => {
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
  } = useCreateCybotValidation();

  const [apiSource, setApiSource] = useState<ApiSource>("platform");
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

  return (
    <div className="create-cybot-container">
      <FormTitle>{t("createCybot")}</FormTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
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
                  placeholder={t("enterPrompt")}
                />
              </FormField>

              <FormField label={t("tools")} horizontal labelWidth="140px">
                <ToolSelector register={register} />
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
                labelWidth="140px"
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
                  labelWidth="140px"
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
                    labelWidth="140px"
                  >
                    <TextArea
                      {...register("introduction")}
                      placeholder={t("enterSelfIntroduction")}
                    />
                  </FormField>

                  <FormField label={t("pricing")} horizontal labelWidth="140px">
                    <div className="price-inputs">
                      <NumberInput
                        value={inputPrice}
                        onChange={setInputPrice}
                        decimal={4}
                        placeholder={t("inputPrice")}
                        aria-label="每千字输入单价"
                      />
                      <NumberInput
                        value={outputPrice}
                        onChange={setOutputPrice}
                        decimal={4}
                        placeholder={t("outputPrice")}
                        aria-label="每千字输出单价"
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
          icon={<PlusIcon />}
        >
          {isSubmitting ? t("creating") : t("create")}
        </Button>
      </form>

      <style jsx>{`
        .create-cybot-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

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

        .form-section {
          padding: 20px;
          border: 1px solid ${theme.border};
          border-radius: 8px;
          background: ${theme.backgroundSecondary};
        }

        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.textDim};
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${theme.border};
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
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

        .check-icon {
          color: ${theme.primary};
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Form Input Global Styles */
        :global(.input),
        :global(.textarea) {
          width: 100%;
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 6px;
          color: ${theme.text};
          font-size: 14px;
          transition: all 0.2s;
        }

        :global(.input:hover),
        :global(.textarea:hover) {
          border-color: ${theme.borderHover};
        }

        :global(.input:focus),
        :global(.textarea:focus) {
          border-color: ${theme.primary};
          outline: none;
          box-shadow: 0 0 0 2px ${theme.primaryGhost};
        }

        :global(.textarea) {
          min-height: 80px;
          resize: vertical;
        }

        /* Responsive Layout */
        @media (max-width: 640px) {
          .create-cybot-container {
            padding: 16px;
          }

          .form-section {
            padding: 16px;
          }

          .section-content {
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

export default CreateCybot;
