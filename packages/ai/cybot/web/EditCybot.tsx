import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";

// types & validations
import { useEditCybotValidation } from "../hooks/useEditCybotValidation";

// data & hooks
import useModelPricing from "../hooks/useModelPricing";
import { useProxySetting } from "../hooks/useProxySetting";
import { useOllamaSettings } from "../hooks/useOllamaSettings";

// components
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
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
    smartReadEnabled?: boolean; // 新增字段
  };
  onClose: () => void;
}

const EditCybot: React.FC<EditCybotProps> = ({ initialValues, onClose }) => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const space = useAppSelector(selectCurrentSpace);
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
  ); // 新增状态管理智能读取选项

  const isCustomProvider = provider === "Custom";
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

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
      smartReadEnabled: initialValues.smartReadEnabled || false, // 重置智能读取选项
    });
    setApiSource(
      initialValues.apiKey || initialValues.provider === "ollama"
        ? "custom"
        : "platform"
    );
  }, [initialValues, reset, setApiSource]);

  // 当 references 或 smartReadEnabled 更新时，同步到表单数据
  useEffect(() => {
    setValue("references", references);
    setValue("smartReadEnabled", smartReadEnabled);
  }, [references, smartReadEnabled, setValue]);

  // 处理 ReferencesSelector 的变化
  const handleReferencesChange = (newReferences) => {
    setReferences(newReferences);
  };

  const handleFormSubmit = async (data: any) => {
    console.log("[EditCybot] handleFormSubmit triggered with data:", data);
    const processedData = {
      ...data,
      prompt: data.prompt || "",
      greeting: data.greeting || "",
      introduction: data.introduction || "",
    };
    await onSubmit(processedData);
    console.log("[EditCybot] handleFormSubmit completed");
    onClose();
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("[EditCybot] Form validation errors:", errors);
    }
  }, [errors]);

  const promptValue = watch("prompt");

  return (
    <div className="edit-cybot-container">
      <FormTitle>{t("editCybot")}</FormTitle>
      <form
        onSubmit={(e) => {
          console.log("[EditCybot] Form submission triggered");
          const submitHandler = handleSubmit(
            (data) => {
              console.log("[EditCybot] handleSubmit success, data:", data);
              handleFormSubmit(data);
            },
            (err) => {
              console.log("[EditCybot] handleSubmit failed with errors:", err);
            }
          );
          submitHandler(e);
        }}
      >
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
              <FormField
                label={t("tags")}
                error={errors.tags?.message}
                help={t(
                  "tagsHelp",
                  "Enter tags separated by commas (e.g., tag1, tag2)"
                )}
                horizontal
                labelWidth="140px"
              >
                <TagsInput
                  name="tags"
                  control={control}
                  placeholder={t("enterTags")}
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

          {/* 参考资料选择 */}
          <section className="form-section">
            <div className="section-title">{t("references")}</div>
            <div className="section-content">
              <FormField
                label={t("smartReadCurrentSpace", "智能读取用户当前空间")}
                help={t("smartReadHelp", "启用后将智能读取当前空间的相关内容")}
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
                help={t("selectReferencesHelp", "选择需要始终使用的参考资料")}
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

          {/* 工具选择 */}
          <section className="form-section">
            <div className="section-title">
              {t("toolSelection", "工具选择")}
            </div>
            <div className="section-content">
              <FormField
                label={t("selectTools", "选择工具")}
                help={t("selectToolsHelp", "请选择要启用的工具")}
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
        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-bottom: 32px;
        }
        .form-section {
          position: relative;
          padding-left: 16px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.textDim};
          margin: 0 0 24px;
          padding-left: 16px;
          position: relative;
          height: 24px;
          line-height: 24px;
        }
        .section-title::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 8px;
          height: 2px;
          background: ${theme.primary};
          opacity: 0.7;
        }
        .section-content {
          display: flex;
          flex-direction: column;
        }
        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .edit-cybot-container {
            padding: 16px;
          }
          .form-layout {
            gap: 32px;
          }
          .form-section {
            padding-left: 12px;
          }
          .section-title {
            font-size: 14px;
            margin-bottom: 20px;
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
