import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";

// components
import TabsNav from "render/web/ui/TabsNav";
import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { SyncIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import AllModelsSelector from "ai/llm/AllModelsSelector";
import { TagsInput } from "web/form/TagsInput";
import ReferencesSelector from "./ReferencesSelector";
import ToolSelector from "ai/tools/ToolSelector";

// hooks
import { useEditCybotValidation } from "../hooks/useEditCybotValidation";
import useModelPricing from "../hooks/useModelPricing";
import { useProxySetting } from "../hooks/useProxySetting";
import { useOllamaSettings } from "../hooks/useOllamaSettings";

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
    customProviderUrl?: string;
    inputPrice?: number;
    outputPrice?: number;
    tags?: string[] | string;
    references?: any[];
    tools?: string[];
    smartReadEnabled?: boolean;
  };
  onClose: () => void;
}

const EditCybot: React.FC<EditCybotProps> = ({ initialValues, onClose }) => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const space = useAppSelector(selectCurrentSpace);
  const [activeTab, setActiveTab] = useState(0);

  const {
    form: {
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
      control,
      formState: { errors, isSubmitting },
    },
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
  } = useEditCybotValidation(initialValues);

  const { apiSource, setApiSource, isOllama } = useOllamaSettings(
    provider,
    setValue
  );
  const [references, setReferences] = useState(initialValues.references || []);
  const [smartReadEnabled, setSmartReadEnabled] = useState(
    initialValues.smartReadEnabled || false
  );

  const isCustomProvider = provider === "Custom";
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  // 定义 Tabs 数据
  const tabs = [
    { id: 0, label: t("basicInfo") },
    { id: 1, label: t("references") },
    { id: 2, label: t("toolSelection") },
    { id: 3, label: t("publishSettings") },
    { id: 4, label: t("advancedSettings") },
  ];

  useEffect(() => {
    reset({
      ...initialValues,
      prompt: initialValues.prompt || "",
      customProviderUrl: initialValues.customProviderUrl || "",
      apiKey: initialValues.apiKey || "",
      tags: Array.isArray(initialValues.tags)
        ? initialValues.tags.join(", ")
        : initialValues.tags || "",
      references: initialValues.references || [],
      tools: initialValues.tools || [],
      smartReadEnabled: initialValues.smartReadEnabled || false,
    });
    setApiSource(
      initialValues.apiKey || initialValues.provider === "ollama"
        ? "custom"
        : "platform"
    );
  }, [initialValues, reset, setApiSource]);

  useEffect(() => {
    setValue("references", references);
    setValue("smartReadEnabled", smartReadEnabled);
  }, [references, smartReadEnabled, setValue]);

  const handleReferencesChange = (newReferences) => {
    setReferences(newReferences);
  };

  const handleFormSubmit = async (data: any) => {
    const processedData = {
      ...data,
      prompt: data.prompt || "",
      greeting: data.greeting || "",
      introduction: data.introduction || "",
    };
    await onSubmit(processedData);
    onClose();
  };

  return (
    <div className="edit-cybot-container">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <TabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === 0 && (
            <section className="form-section">
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
                    value={watch("prompt")}
                    onChange={(e) => setValue("prompt", e.target.value)}
                    placeholder={t("enterPrompt")}
                    rows={6}
                  />
                </FormField>
                <FormField
                  label={t("tags")}
                  error={errors.tags?.message}
                  help={t("tagsHelp")}
                  horizontal
                  labelWidth="140px"
                >
                  <TagsInput
                    name="tags"
                    control={control}
                    placeholder={t("enterTags")}
                  />
                </FormField>
                <FormField
                  label={t("model")}
                  required
                  error={errors.model?.message}
                  horizontal
                  labelWidth="140px"
                >
                  <AllModelsSelector
                    watch={watch}
                    setValue={setValue}
                    register={register}
                    defaultModel={watch("model") || initialValues.model}
                    t={t}
                  />
                </FormField>
              </div>
            </section>
          )}

          {activeTab === 1 && (
            <section className="form-section">
              <div className="section-content">
                <FormField
                  label={t("smartReadCurrentSpace")}
                  help={t("smartReadHelp")}
                  horizontal
                  labelWidth="140px"
                >
                  <ToggleSwitch
                    checked={smartReadEnabled}
                    onChange={(checked) => setSmartReadEnabled(checked)}
                  />
                </FormField>
                <FormField
                  label={t("selectReferences")}
                  help={t("selectReferencesHelp")}
                  horizontal
                  labelWidth="140px"
                  error={errors.references?.message}
                >
                  <ReferencesSelector
                    space={space}
                    references={references}
                    onChange={handleReferencesChange}
                    t={t}
                  />
                </FormField>
              </div>
            </section>
          )}

          {activeTab === 2 && (
            <section className="form-section">
              <div className="section-content">
                <FormField
                  label={t("selectTools")}
                  help={t("selectToolsHelp")}
                  horizontal
                  labelWidth="140px"
                  error={errors.tools?.message}
                >
                  <ToolSelector
                    register={register}
                    defaultValue={watch("tools") || []}
                  />
                </FormField>
              </div>
            </section>
          )}

          {activeTab === 3 && (
            <section className="form-section">
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
                    <FormField
                      label={t("pricing")}
                      horizontal
                      labelWidth="140px"
                    >
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
          )}

          {activeTab === 4 && (
            <section className="form-section">
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
                {apiSource === "custom" && !isOllama && (
                  <FormField
                    label={t("apiKey")}
                    required={!isOllama && !useServerProxy}
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
          )}
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
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }

        .tab-content {
          margin-bottom: 32px;
          min-height: 400px;
        }

        .form-section {
          position: relative;
          padding: 8px 16px;
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: center;
        }

        @media (max-width: 640px) {
          .edit-cybot-container {
            padding: 16px;
          }

          .price-inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EditCybot;
