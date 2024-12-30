import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

//type relate
import type { Model } from "../llm/types";
import { useCreateCybotValidation } from "./hooks/useCreateCybotValidation";

//data relate
import { getModelsByProvider, providerOptions } from "../llm/providers";

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
import FormContainer from 'web/form/FormContainer';
import { Combobox } from "web/form/Combobox";


const PROXY_DISABLED_PROVIDERS = ["ollama", "custom", "deepseek"];

const getOrderedProviderOptions = () => {
  return [
    { name: "custom" },
    ...providerOptions.map((item) => ({ name: item }))
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
      formState: { errors, isSubmitting }
    },
    provider,
    isPrivate,
    isEncrypted,
    useServerProxy,
    onSubmit
  } = useCreateCybotValidation();

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

  useEffect(() => {
    if (PROXY_DISABLED_PROVIDERS.includes(provider)) {
      setValue("useServerProxy", false);
    } else {
      setValue("useServerProxy", true);
    }
  }, [provider, setValue]);

  const isProxyDisabled = PROXY_DISABLED_PROVIDERS.includes(provider);



  return (
    <FormContainer>
      <style>
        {`
          .provider-container {
            display: grid;
            grid-template-columns: ${showCustomUrl ? "1fr 1fr" : "1fr 1fr 1fr"};
            gap: 16px;
            margin-bottom: 16px;
          }

          .url-input {
            grid-column: 2 / -1;
          }

          .custom-url-field {
            animation: fadeIn 0.3s ease-in-out;
          }

          .model-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
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

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1; 
              transform: translateY(0);
            }
          }
        `}
      </style>

      <FormTitle>{t("createCybot")}</FormTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label={t("cybotName")}
          required
          error={errors.name?.message}
        >
          <Input
            {...register("name")}
            placeholder={t("enterCybotName")}
          />
        </FormField>

        <div className="provider-container">
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



          {showCustomUrl && (
            <FormField
              label={t("providerUrl")}
              error={errors.customProviderUrl?.message}
              className="custom-url-field"
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
            {showCustomModel ? (
              <Input
                {...register("model")}
                placeholder={t("enterModelName")}
              />
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
                    <span className="model-name">{item.name}</span>
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
        </div>

        <FormField
          label={t("apiKeyField")}
          error={errors.apiKey?.message}
        >
          <PasswordInput
            {...register("apiKey")}
            placeholder={t("enterApiKey")}
          />
        </FormField>

        <FormField
          label={t("useServerProxy")}
          help={isProxyDisabled ? t("proxyNotAvailableForProvider") : undefined}
        >
          <ToggleSwitch
            checked={useServerProxy}
            onChange={(checked) => setValue("useServerProxy", checked)}
            ariaLabelledby="server-proxy-label"
            disabled={isProxyDisabled}
          />
        </FormField>

        <FormField
          label={t("prompt")}
          error={errors.prompt?.message}
        >
          <TextArea
            {...register("prompt")}
            placeholder={t("enterPrompt")}
          />
        </FormField>

        <FormField
          label={t("greetingMessage")}
          error={errors.greeting?.message}
        >
          <Input
            {...register("greeting")}
            placeholder={t("enterGreetingMessage")}
          />
        </FormField>

        <FormField
          label={t("selfIntroduction")}
          error={errors.introduction?.message}
        >
          <TextArea
            {...register("introduction")}
            placeholder={t("enterSelfIntroduction")}
          />
        </FormField>

        <ToolSelector register={register} />

        <FormField label={t("private")}>
          <ToggleSwitch
            checked={isPrivate}
            onChange={(checked) => setValue("isPrivate", checked)}
            ariaLabelledby="private-label"
          />
        </FormField>

        <FormField label={t("encrypted")}>
          <ToggleSwitch
            checked={isEncrypted}
            onChange={(checked) => setValue("isEncrypted", checked)}
            ariaLabelledby="encrypted-label"
          />
        </FormField>

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
    </FormContainer>
  );
};

export default CreateCybot;
