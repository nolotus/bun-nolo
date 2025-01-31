import type React from "react";
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
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

// types
import type { Model } from "../../llm/types";
import { useEditCybotValidation } from "../hooks/useEditCybotValidation";

// data & hooks
import { getModelsByProvider, providerOptions } from "../../llm/providers";
import useModelPricing from "../hooks/useModelPricing";
import { useProxySetting } from "../hooks/useProxySetting";
import { useState, useEffect } from "react";

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
  } = useEditCybotValidation(initialValues);

  // 主要状态
  const [apiSource, setApiSource] = useState<ApiSource>(
    initialValues.apiKey ? "custom" : "platform"
  );
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
                  setApiSource(checked ? "custom" : "platform");
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
            <FormField
              label={t("provider")}
              required
              error={errors.provider?.message}
            >
              <Combobox
                items={getOrderedProviderOptions()}
                selectedItem={provider ? { name: provider } : null}
                onChange={(item) => {
                  setValue("provider", item?.name || "");
                  setProviderInputValue(item?.name || "");
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
          display: grid;
          gap: 24px;
          grid-template-columns: 1fr;

          @media (min-width: 1024px) {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }
        }

        .form-section {
          padding: 24px;
          border: 1px solid ${theme.border};
          border-radius: 8px;
          background: ${theme.backgroundSecondary};
          height: fit-content;
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

        /* 其他样式与 CreateCybot 保持一致 */
      `}</style>
    </div>
  );
};

export default EditCybot;
