import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

// types & validations
import type { Model } from "../../llm/types";
import { useEditCybotValidation } from "../hooks/useEditCybotValidation";

// data & hooks
import { getModelsByProvider } from "../../llm/providers";
import useModelPricing from "../hooks/useModelPricing";
import { useProxySetting } from "../hooks/useProxySetting";

// components
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { SyncIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
// import ToolSelector from "../../tools/ToolSelector";
import ModelSelector from "ai/llm/ModelSelector";
import ProviderSelector from "ai/llm/ProviderSelector";

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
    // tools?: string[]; // 工具部分暂时停用
    customProviderUrl?: string;
    inputPrice?: number;
    outputPrice?: number;
  };
  onClose: () => void;
}

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
          {/* 基本信息与行为 */}
          <section className="form-section">
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
            </div>
          </section>

          {/* 模型配置 */}
          <section className="form-section">
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
                <ProviderSelector
                  provider={provider}
                  setValue={setValue}
                  providerInputValue={providerInputValue}
                  setProviderInputValue={setProviderInputValue}
                  t={t}
                  error={errors.provider?.message}
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
                <ModelSelector
                  isCustomProvider={isCustomProvider}
                  models={models}
                  watch={watch}
                  setValue={setValue}
                  register={register}
                  defaultModel={watch("model") || initialValues.model}
                  t={t}
                />
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
          </section>

          {/* 社区设置 */}
          <section className="form-section">
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
          </section>
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

      <style>{`
        .edit-cybot-container {
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
        @media (max-width: 640px) {
          .edit-cybot-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default EditCybot;
