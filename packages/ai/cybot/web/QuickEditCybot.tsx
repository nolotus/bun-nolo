import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { pick } from "rambda";
import { useTheme } from "app/theme";

// components
import Button from "web/ui/Button";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { SyncIcon } from "@primer/octicons-react";
import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import Textarea from "web/form/Textarea";
import FormTitle from "web/form/FormTitle";

// data & types
import { patchData } from "database/dbSlice";
import { getModelsByProvider } from "ai/llm/providers";
import type { Model } from "ai/llm/types";

// 使用更新后的 ProviderSelector 与 ModelSelector
import ProviderSelector from "ai/llm/ProviderSelector";
import ModelSelector from "ai/llm/ModelSelector";

const QuickEditCybot = ({ initialValues, onClose }) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  console.log("initialValues", initialValues);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...initialValues,
      name: initialValues.name || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
      useServerProxy: initialValues.useServerProxy ?? true,
    },
  });

  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const [models, setModels] = useState<Model[]>([]);
  const [providerInputValue, setProviderInputValue] = useState(provider || "");

  const isCustomProvider = provider === "Custom";

  useEffect(() => {
    setProviderInputValue(provider || "");
    if (provider && !isCustomProvider) {
      setValue("customProviderUrl", "");
      const modelsList = getModelsByProvider(provider);
      setModels(modelsList);
      if (modelsList.length > 0 && !watch("model")) {
        setValue("model", modelsList[0].name);
      }
    } else {
      setModels([]);
    }
  }, [provider, setValue, isCustomProvider, watch]);

  const onSubmit = async (data) => {
    const submitData = { ...data, type: DataType.CYBOT };
    const allowedKeys = [
      "name",
      "prompt",
      "provider",
      "customProviderUrl",
      "model",
      "useServerProxy",
    ];
    const changes = pick(allowedKeys, submitData);
    await dispatch(
      patchData({
        dbKey: initialValues.dbKey || initialValues.id,
        changes,
      })
    );
    onClose();
  };

  return (
    <div className="quick-edit-container">
      <FormTitle>{t("quickEdit")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-layout">
          <FormField
            label={t("cybotName")}
            required
            error={errors.name?.message}
            horizontal
            labelWidth="140px"
          >
            <Input {...register("name")} placeholder={t("enterCybotName")} />
          </FormField>
          <FormField
            label={t("prompt")}
            error={errors.prompt?.message}
            help={t("promptHelp")}
            horizontal
            labelWidth="140px"
          >
            <Textarea {...register("prompt")} placeholder={t("enterPrompt")} />
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
          {isCustomProvider && (
            <FormField
              label={t("providerUrl")}
              error={errors.customProviderUrl?.message}
              horizontal
              labelWidth="140px"
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
          <FormField
            label={t("useServerProxy")}
            help={t("proxyHelp")}
            horizontal
            labelWidth="140px"
          >
            <ToggleSwitch
              checked={useServerProxy}
              onChange={(checked) => setValue("useServerProxy", checked)}
            />
          </FormField>
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
        .quick-edit-container {
          max-width: 800px;
          margin: 24px auto;
          padding: 0 24px;
        }
        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 32px;
        }
      `}</style>
    </div>
  );
};

export default QuickEditCybot;
