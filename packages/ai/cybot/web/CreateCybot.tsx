import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";

// components
import TabsNav from "render/web/ui/TabsNav";
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { PlusIcon } from "@primer/octicons-react";
import { MdRefresh, MdInfoOutline } from "react-icons/md";
import Button from "render/web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import AllModelsSelector from "ai/llm/AllModelsSelector";
import { TagsInput } from "web/form/TagsInput";
import ReferencesSelector from "./ReferencesSelector";
import ToolSelector from "ai/tools/ToolSelector";
import { Slider } from "web/form/Slider";
import { Tooltip } from "render/web/ui/Tooltip";

// hooks
import useModelPricing from "../hooks/useModelPricing";
import { useOllamaSettings } from "../hooks/useOllamaSettings";
import { useProxySetting } from "../hooks/useProxySetting";
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  DEFAULT_FREQUENCY_PENALTY,
  DEFAULT_PRESENCE_PENALTY,
  DEFAULT_MAX_TOKENS,
} from "../common/createCybotSchema";
import { useCybotValidation } from "../common/useCybotFormValidation";

// 模型参数配置
const PARAMETER_CONFIGS = [
  {
    key: "temperature",
    min: 0,
    max: 2,
    step: 0.1,
    default: DEFAULT_TEMPERATURE,
    format: (val: number) => val.toFixed(1),
  },
  {
    key: "topP",
    min: 0,
    max: 1,
    step: 0.1,
    default: DEFAULT_TOP_P,
    format: (val: number) => val.toFixed(1),
  },
  {
    key: "frequencyPenalty",
    min: -2,
    max: 2,
    step: 0.1,
    default: DEFAULT_FREQUENCY_PENALTY,
    format: (val: number) => val.toFixed(1),
  },
  {
    key: "presencePenalty",
    min: -2,
    max: 2,
    step: 0.1,
    default: DEFAULT_PRESENCE_PENALTY,
    format: (val: number) => val.toFixed(1),
  },
  {
    key: "maxTokens",
    min: 1,
    max: 16384,
    step: 100,
    default: DEFAULT_MAX_TOKENS,
    format: (val: number) => val.toString(),
  },
];

// 参数键映射（翻译键 -> 表单键）
const PARAMETER_FORM_KEYS = {
  temperature: "temperature",
  topP: "top_p",
  frequencyPenalty: "frequency_penalty",
  presencePenalty: "presence_penalty",
  maxTokens: "max_tokens",
};

// 模型参数组件
const ModelParameters: React.FC<any> = ({
  register,
  watch,
  setValue,
  t,
  theme,
}) => {
  const handleResetParameters = useCallback(() => {
    PARAMETER_CONFIGS.forEach((config) => {
      const formKey = PARAMETER_FORM_KEYS[config.key];
      setValue(formKey, config.default);
      register(formKey, { value: config.default });
    });
  }, [setValue, register]);

  return (
    <div className="model-parameters">
      <div className="parameters-header">
        <h3>{t("modelParameters")}</h3>
        <Button
          variant="ghost"
          size="small"
          icon={<MdRefresh size={16} />}
          onClick={handleResetParameters}
          type="button"
        >
          {t("resetToDefaults")}
        </Button>
      </div>

      <div className="parameters-grid">
        {PARAMETER_CONFIGS.map((config) => {
          const formKey = PARAMETER_FORM_KEYS[config.key];
          return (
            <div key={config.key} className="parameter-item">
              <div className="parameter-label">
                <span className="label-text">{t(config.key)}</span>
                <Tooltip
                  content={t(`${config.key}Help`)}
                  placement="right"
                  delay={200}
                >
                  <MdInfoOutline size={16} className="info-icon" />
                </Tooltip>
              </div>

              <div className="parameter-control">
                <Slider
                  value={watch(formKey) ?? config.default}
                  onChange={(value) => {
                    setValue(formKey, value);
                    register(formKey, { value });
                  }}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  showValue
                  ariaLabel={t(config.key)}
                />
                <div className="parameter-info">
                  <span className="parameter-range">
                    {config.min} - {config.max}
                  </span>
                  <span className="parameter-current">
                    {config.format(watch(formKey) ?? config.default)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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

  // 定义 Tabs 数据
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
          <div className="tab-content-wrapper">
            <FormField
              label={t("cybotName")}
              required
              error={errors.name?.message}
              {...commonProps}
            >
              <Input {...register("name")} placeholder={t("enterCybotName")} />
            </FormField>
            <FormField
              label={t("prompt")}
              error={errors.prompt?.message}
              help={t("promptHelp")}
              {...commonProps}
            >
              <TextArea
                {...register("prompt")}
                placeholder={t("enterPrompt")}
                rows={6}
              />
            </FormField>
            <FormField
              label={t("tags")}
              error={errors.tags?.message}
              help={t("tagsHelp")}
              {...commonProps}
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
              {...commonProps}
            >
              <AllModelsSelector
                watch={watch}
                setValue={setValue}
                register={register}
                defaultModel={watch("model")}
                t={t}
              />
            </FormField>
          </div>
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

        /* 模型参数样式 */
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

        /* 移动端优化 */
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

        /* 滚动条 */
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
