import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useTheme } from "app/theme";
import { getModelsByProvider, providerOptions } from "../llm/providers";
import type { Model } from "../llm/types";

// web imports
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import ToggleSwitch from "web/form/ToggleSwitch";
import { PlusIcon, CheckIcon } from "@primer/octicons-react";
import Select from "../llm/Select";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import ToolSelector from "../tools/ToolSelector";
import FormContainer from 'web/form/FormContainer';
import TextArea from "web/form/Textarea";

const schema = z.object({
  name: z.string().trim().min(1, "Cybot name is required"),
  provider: z.string().trim().min(1, "Provider is required"),
  customProviderUrl: z.string().trim().optional(),
  model: z.string().trim().min(1, "Model is required"),
  apiKey: z.string().optional(),
  tools: z.array(z.string()),
  isPrivate: z.boolean(),
  isEncrypted: z.boolean(),
  useServerProxy: z.boolean(),
  prompt: z.string().trim().optional(),
  greeting: z.string().trim().optional(),
  introduction: z.string().trim().optional(),
});


type FormData = z.infer<typeof schema>;

const PROXY_DISABLED_PROVIDERS = ["Ollama", "Custom", "Deepseek"];

const getOrderedProviderOptions = () => {
  return [
    { name: "Custom" },
    ...providerOptions.map((item) => ({ name: item }))
  ];
};

const CreateCybot: React.FC = () => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { createNewDialog } = useCreateDialog();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tools: [],
      isPrivate: false,
      isEncrypted: false,
      provider: "",
      customProviderUrl: "",
      model: "",
      useServerProxy: true,
    },
  });

  const provider = watch("provider");
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

  // 处理服务器中转的自动开关
  useEffect(() => {
    if (PROXY_DISABLED_PROVIDERS.includes(provider)) {
      setValue("useServerProxy", false);
    } else {
      setValue("useServerProxy", true);
    }
  }, [provider, setValue]);

  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");
  const useServerProxy = watch("useServerProxy");
  const isProxyDisabled = PROXY_DISABLED_PROVIDERS.includes(provider);

  const onSubmit = async (data: FormData) => {
    const writeResult = await dispatch(
      write({
        data: {
          type: DataType.Cybot,
          ...data,
        },
        flags: { isJSON: true },
        userId: auth.user?.userId,
      })
    ).unwrap();
    const cybotId = writeResult.id;

    await createNewDialog({ cybots: [cybotId] });
  };

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
            <Select
              items={getOrderedProviderOptions()}
              selectedItem={provider ? { name: provider } : undefined}
              onSelectedItemChange={(item) => {
                setValue("provider", item.name);
                setProviderInputValue(item.name);
                if (item.name !== "Custom") {
                  setValue("customProviderUrl", "");
                  setValue("model", "");
                }
              }}
              itemToString={(item) => (item ? item.name : "")}
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
              <Select
                items={models}
                selectedItem={models.find((model) => watch("model") === model.name)}
                onSelectedItemChange={(item) => setValue("model", item.name)}
                itemToString={(item) => (item ? item.name : "")}
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
                placeholder={t("selectModel")}
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
