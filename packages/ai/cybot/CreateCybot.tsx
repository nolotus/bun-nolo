import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

//type relate
import type { Model } from "../llm/types";
import { useCreateCybotValidation } from "./hooks/useCreateCybotValidation";

//data relate
import { getModelsByProvider, providerOptions } from "../llm/providers";
import useModelPricing from "./hooks/useModelPricing";
import { useProxySetting } from "./hooks/useProxySetting";

// web imports
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/form/ToggleSwitch";
import { PlusIcon, CheckIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import ToolSelector from "../tools/ToolSelector";
import { Combobox } from "web/form/Combobox";

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
    isPrivate,
    isEncrypted,
    useServerProxy,
    onSubmit,
  } = useCreateCybotValidation();

  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } = useModelPricing(provider, watch("model"));

  const [models, setModels] = useState<Model[]>([]);
  const [providerInputValue, setProviderInputValue] = useState<string>(provider || "");
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);

  useEffect(() => {
    setProviderInputValue(provider || "");
    setShowCustomUrl(provider === "Custom");
    setShowCustomModel(provider === "Custom");
  }, [provider]);

  useEffect(() => {
    if (provider !== "Custom") {
      const modelsList = getModelsByProvider(providerInputValue);
      setModels(modelsList);
      if (modelsList.length > 0) {
        setValue("model", modelsList[0].name);
      }
    }
  }, [providerInputValue, setValue, provider]);

  const isProxyDisabled = useProxySetting(provider, setValue);

  return (
    <div className="create-cybot-container">
      <FormTitle>{t("createCybot")}</FormTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="section basic-info">
          <FormField
            label={t("cybotName")}
            required
            error={errors.name?.message}
            horizontal
          >
            <Input {...register("name")} placeholder={t("enterCybotName")} />
          </FormField>
        </div>

        <div className="section model-config">
          <div className="section-title">{t("modelConfiguration")}</div>

          <FormField
            label={t("provider")}
            required
            error={errors.provider?.message}
            horizontal
          >
            <Combobox
              items={getOrderedProviderOptions()}
              selectedItem={provider ? { name: provider } : null}
              onChange={(item) => {
                setValue("provider", item?.name || "");
                setProviderInputValue(item?.name || "");
                if (!item || item.name !== "Custom") {
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
          >
            {showCustomModel ? (
              <Input {...register("model")} placeholder={t("enterModelName")} />
            ) : (
              <Combobox
                items={models}
                selectedItem={models.find((model) => watch("model") === model.name) || null}
                onChange={(item) => setValue("model", item?.name || "")}
                labelField="name"
                valueField="name"
                placeholder={t("selectModel")}
                renderOptionContent={(item, isHighlighted, isSelected) => (
                  <div className="model-option">
                    <span>{item.name}</span>
                    <div className="model-indicators">
                      {item.hasVision && (
                        <span className="vision-badge">{t("supportsVision")}</span>
                      )}
                      {isSelected && <CheckIcon size={16} className="check-icon" />}
                    </div>
                  </div>
                )}
              />
            )}
          </FormField>

          {showCustomUrl && (
            <FormField
              label={t("providerUrl")}
              error={errors.customProviderUrl?.message}
              horizontal
            >
              <Input
                {...register("customProviderUrl")}
                placeholder={t("enterProviderUrl")}
                type="url"
              />
            </FormField>
          )}

          <FormField
            label={t("useServerProxy")}
            help={isProxyDisabled ? t("proxyNotAvailableForProvider") : undefined}
            horizontal
            labelWidth="120px"
          >
            <ToggleSwitch
              checked={useServerProxy}
              onChange={(checked) => setValue("useServerProxy", checked)}
              ariaLabelledby="server-proxy-label"
              disabled={isProxyDisabled}
            />
          </FormField>

          <FormField
            label={t("apiKeyField")}
            error={errors.apiKey?.message}
            horizontal
          >
            <PasswordInput {...register("apiKey")} placeholder={t("enterApiKey")} />
          </FormField>

          <div className="price-fields">
            <FormField
              label={t("inputPrice")}
              horizontal
              labelWidth="100px"
            >
              <Input
                type="number"
                value={inputPrice}
                onChange={(e) => setInputPrice(Number(e.target.value))}
              />
            </FormField>

            <FormField
              label={t("outputPrice")}
              horizontal
              labelWidth="100px"
            >
              <Input
                type="number"
                value={outputPrice}
                onChange={(e) => setOutputPrice(Number(e.target.value))}
              />
            </FormField>
          </div>
        </div>

        <div className="section prompt-section">
          <div className="section-title">{t("behaviorSettings")}</div>

          <FormField
            label={t("prompt")}
            error={errors.prompt?.message}
          >
            <TextArea {...register("prompt")} placeholder={t("enterPrompt")} />
          </FormField>

          <FormField
            label={t("greetingMessage")}
            error={errors.greeting?.message}
            horizontal
          >
            <Input {...register("greeting")} placeholder={t("enterGreetingMessage")} />
          </FormField>

          <FormField
            label={t("selfIntroduction")}
            error={errors.introduction?.message}
          >
            <TextArea {...register("introduction")} placeholder={t("enterSelfIntroduction")} />
          </FormField>
        </div>

        <div className="section">
          <div className="section-title">{t("capabilities")}</div>
          <ToolSelector register={register} />
        </div>

        <div className="section">
          <div className="section-title">{t("privacy")}</div>
          <div className="toggle-fields">
            <FormField
              label={t("private")}
              horizontal
              labelWidth="120px"
            >
              <ToggleSwitch
                checked={isPrivate}
                onChange={(checked) => setValue("isPrivate", checked)}
                ariaLabelledby="private-label"
              />
            </FormField>

            <FormField
              label={t("encrypted")}
              horizontal
              labelWidth="120px"
            >
              <ToggleSwitch
                checked={isEncrypted}
                onChange={(checked) => setValue("isEncrypted", checked)}
                ariaLabelledby="encrypted-label"
              />
            </FormField>
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

        <style>
          {`
            .create-cybot-container {
              max-width: 900px;
              margin: 0 auto;
              padding: 32px;
              background: ${theme.background};
              border-radius: 12px;
            }


            .section {
              margin-bottom: 40px;
              padding-bottom: 32px;
              border-bottom: 1px solid ${theme.border};
            }


            .section:last-child {
              border-bottom: none;
              margin-bottom: 24px;
            }


            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: ${theme.textDim};
              margin-bottom: 24px;
            }


            .price-fields {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
              margin: 16px 0;
            }


            .toggle-fields {
              display: grid;
              gap: 16px;
              max-width: 400px;
            }


            .model-option {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
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


            @media (max-width: 768px) {
              .create-cybot-container {
                padding: 20px;
                margin: 0;
                border-radius: 0;
              }


              .section {
                margin-bottom: 32px;
                padding-bottom: 24px;
              }


              .section-title {
                margin-bottom: 20px;
              }


              .price-fields {
                grid-template-columns: 1fr;
              }


              .toggle-fields {
                max-width: 100%;
              }
            }


            @media (max-width: 480px) {
              .create-cybot-container {
                padding: 16px;
              }


              .section {
                margin-bottom: 24px;
                padding-bottom: 20px;
              }


              .section-title {
                font-size: 15px;
                margin-bottom: 16px;
              }
            }
          `}
        </style>

      </form>
    </div>
  );
};

export default CreateCybot;
