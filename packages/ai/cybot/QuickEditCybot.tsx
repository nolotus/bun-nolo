import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { pick } from "rambda";
import { useTheme } from "app/theme";

import Button from "web/ui/Button";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { SyncIcon, CheckIcon } from "@primer/octicons-react";
import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import Textarea from "web/form/Textarea";

import { patchData } from "database/dbSlice";
import { getModelsByProvider, providerOptions } from "../llm/providers";
import type { Model } from "../llm/types";
import ToolSelector from "../tools/ToolSelector";
import Combobox from "web/form/Combobox";

const getOrderedProviderOptions = () => {
  return [
    { name: "Custom" },
    ...providerOptions.map((item) => ({ name: item })),
  ];
};

const QuickEditCybot = ({ initialValues, onClose }) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      ...initialValues,
      name: initialValues.name || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
      tools: initialValues.tools || [],
    },
  });

  const provider = watch("provider");
  const [models, setModels] = useState<Model[]>([]);
  const [providerInputValue, setProviderInputValue] = useState<string>(
    provider || ""
  );
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);

  const useServerProxy = watch("useServerProxy");

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
    reset({
      ...initialValues,
      name: initialValues.name || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
      tools: initialValues.tools || [],
    });
  }, [reset, initialValues]);

  const onSubmit = async (data) => {
    const submitData = { ...data, type: DataType.Cybot };
    const allowedKeys = [
      "name",
      "prompt",
      "provider",
      "customProviderUrl",
      "model",
      "apiKey",
      "useServerProxy",
      "tools",
    ];
    const changes = pick(allowedKeys, submitData);

    await dispatch(
      patchData({
        id: initialValues.id,
        changes,
      })
    );
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <style>
        {`
          .provider-container {
            display: grid;
            grid-template-columns: ${showCustomUrl ? "1fr 1fr" : "1fr 1fr 1fr"};
            gap: 16px;
            margin-bottom: 16px;
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

      <FormField label={t("cybotName")} required error={errors.name?.message}>
        <Input {...register("name", { required: t("nameRequired") })} />
      </FormField>

      <FormField label={t("prompt")} error={errors.prompt?.message}>
        <Textarea {...register("prompt")} />
      </FormField>

      <div className="provider-container">
        <FormField
          label={t("provider")}
          required
          error={errors.provider?.message}
        >
          <FormField
            label={t("provider")}
            required
            error={errors.provider?.message}
          >
            <Combobox
              items={getOrderedProviderOptions()}
              selectedItem={provider ? { name: provider } : undefined}
              onChange={(item) => {
                setValue("provider", item?.name);
                setProviderInputValue(item?.name || "");
                if (item?.name !== "Custom") {
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

        <FormField label={t("model")} required error={errors.model?.message}>
          {showCustomModel ? (
            <Input {...register("model")} placeholder={t("enterModelName")} />
          ) : (
            <Combobox
              items={models}
              selectedItem={models.find(
                (model) => watch("model") === model.name
              )}
              onChange={(item) => setValue("model", item?.name)}
              labelField="name"
              valueField="name"
              placeholder={t("selectModel")}
              renderOptionContent={(item, isHighlighted, isSelected) => (
                <div className="model-option">
                  <span className="model-name">{item.name}</span>
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
      </div>

      <FormField label={t("useServerProxy")}>
        <ToggleSwitch
          checked={useServerProxy}
          onChange={(checked) => setValue("useServerProxy", checked)}
          ariaLabelledby="server-proxy-label"
        />
      </FormField>

      <FormField label={t("tools")}>
        <ToolSelector register={register} />
      </FormField>

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
  );
};

export default QuickEditCybot;
