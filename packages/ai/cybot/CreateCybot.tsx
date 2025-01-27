import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

// types
import type { Model } from "../llm/types";
import { useCreateCybotValidation } from "./hooks/useCreateCybotValidation";

// data & hooks
import { getModelsByProvider, providerOptions } from "../llm/providers";
import useModelPricing from "./hooks/useModelPricing";
import { useProxySetting } from "./hooks/useProxySetting";

// components
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { PlusIcon, CheckIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import ToolSelector from "../tools/ToolSelector";
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

  // form hooks
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

  // 主要状态
  const [apiSource, setApiSource] = useState<ApiSource>("platform");
  const [models, setModels] = useState<Model[]>([]);

  // provider相关状态
  const [providerInputValue, setProviderInputValue] = useState<string>(
    provider || ""
  );
  const isCustomProvider = provider === "Custom";

  // 价格和代理hooks
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  // 监听API来源变化
  useEffect(() => {
    if (apiSource === "platform") {
      setValue("apiKey", "");
      setValue("useServerProxy", true);
    }
  }, [apiSource, setValue]);

  // 监听Provider变化
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
        {/* 基础信息部分 */}
        <div className="form-section">
          <div className="section-title">{t("basicInfo")}</div>
          <div className="section-content">
            <FormField
              label={t("cybotName")}
              required
              error={errors.name?.message}
            >
              <Input {...register("name")} placeholder={t("enterCybotName")} />
            </FormField>

            <FormField
              label={t("apiSource")}
              help={
                apiSource === "platform"
                  ? t("platformApiHelp")
                  : t("customApiHelp")
              }
            >
              <ToggleSwitch
                checked={apiSource === "custom"}
                onChange={(checked) => {
                  const newSource = checked ? "custom" : "platform";
                  setApiSource(newSource);
                  // 重置相关字段
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
          </div>
        </div>
        {/* 模型配置部分 */}
        <div className="form-section">
          <div className="section-title">{t("modelConfiguration")}</div>
          <div className="section-content">
            {/* Provider 选择 */}
            <FormField
              label={t("provider")}
              required
              error={errors.provider?.message}
            >
              <Combobox
                items={getOrderedProviderOptions()}
                selectedItem={provider ? { name: provider } : null}
                onChange={(item) => {
                  const newProvider = item?.name || "";
                  setValue("provider", newProvider);
                  setProviderInputValue(newProvider);

                  // 重置相关字段
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

            {/* 自定义 Provider URL */}
            {(isCustomProvider || apiSource === "custom") && (
              <FormField
                label={t("providerUrl")}
                error={errors.customProviderUrl?.message}
                help={t("providerUrlHelp")}
              >
                <Input
                  {...register("customProviderUrl")}
                  placeholder={t("enterProviderUrl")}
                  type="url"
                />
              </FormField>
            )}

            {/* 模型选择或输入 */}
            <FormField
              label={t("model")}
              required
              error={errors.model?.message}
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

            {/* API Key 输入 */}
            {apiSource === "custom" && (
              <FormField
                label={t("apiKey")}
                required
                error={errors.apiKey?.message}
                help={t("apiKeyHelp")}
              >
                <PasswordInput
                  {...register("apiKey")}
                  placeholder={t("enterApiKey")}
                />
              </FormField>
            )}

            {/* 代理设置 */}
            <FormField
              label={t("useServerProxy")}
              help={
                isProxyDisabled
                  ? t("proxyNotAvailableForProvider")
                  : t("proxyHelp")
              }
            >
              <ToggleSwitch
                checked={useServerProxy}
                onChange={(checked) => setValue("useServerProxy", checked)}
                disabled={isProxyDisabled || apiSource === "platform"}
              />
            </FormField>
          </div>
        </div>
        {/* 行为设置部分 */}
        <div className="form-section">
          <div className="section-title">{t("behaviorSettings")}</div>
          <div className="section-content">
            <FormField
              label={t("prompt")}
              error={errors.prompt?.message}
              help={t("promptHelp")}
            >
              <TextArea
                {...register("prompt")}
                placeholder={t("enterPrompt")}
              />
            </FormField>

            <ToolSelector register={register} />
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
                >
                  <TextArea
                    {...register("introduction")}
                    placeholder={t("enterSelfIntroduction")}
                  />
                </FormField>

                <div className="price-settings">
                  <FormField label={t("inputPrice")} help={t("inputPriceHelp")}>
                    <Input
                      type="number"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </FormField>

                  <FormField
                    label={t("outputPrice")}
                    help={t("outputPriceHelp")}
                  >
                    <Input
                      type="number"
                      value={outputPrice}
                      onChange={(e) => setOutputPrice(Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </FormField>
                </div>
              </>
            )}
          </div>
        </div>
        {/* 提交按钮 */}
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

        <style jsx>{`
          .create-cybot-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 24px;
          }

          .form-section {
            margin-bottom: 32px;
            padding: 24px;
            border: 1px solid ${theme.border};
            border-radius: 8px;
            background: ${theme.backgroundSecondary};
          }

          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: ${theme.textDim};
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid ${theme.border};
          }

          .section-content {
            display: grid;
            gap: 20px;
          }

          .price-settings {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .model-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
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

          @media (max-width: 640px) {
            .create-cybot-container {
              padding: 16px;
            }

            .form-section {
              padding: 16px;
              margin-bottom: 24px;
            }

            .section-content {
              gap: 16px;
            }

            .price-settings {
              grid-template-columns: 1fr;
            }

            .section-title {
              font-size: 15px;
              margin-bottom: 20px;
            }
          }
        `}</style>
      </form>
    </div>
  );
};

export default CreateCybot;
