// CreateCybot.tsx

import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DataType } from "create/types";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import ToggleSwitch from "render/ui/ToggleSwitch";
import withTranslations from "i18n/withTranslations";
import {
  FormContainer,
  FormTitle,
  FormField,
  Label,
  FormFieldComponent,
  Select,
} from "render/CommonFormComponents";
import { Button } from "render/ui/Button";

import ToolSelector from "../tools/ToolSelector";
import { providerOptions, getModelsByProvider, Model } from "../llm/providers";

interface CreateCybotProps {
  onClose: () => void;
}

const CreateCybot: React.FC<CreateCybotProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { isLoading: isDialogLoading, createNewDialog } = useCreateDialog();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      tools: [],
      isPrivate: false,
      isEncrypted: false,
      provider: providerOptions[0],
      useServerProxy: false,
    },
  });

  const provider = watch("provider");
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    const modelsList = getModelsByProvider(provider);
    setModels(modelsList);
    if (modelsList.length > 0) {
      setValue("model", modelsList[0].name);
    }
  }, [provider, setValue]);

  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");
  const useServerProxy = watch("useServerProxy");

  const onSubmit = useCallback(
    async (data: any) => {
      console.log("Form data before submission:", data); // 添加这行来检查数据
      try {
        const writeResult = await dispatch(
          write({
            data: {
              type: DataType.Cybot,
              ...data,
            },
            flags: { isJSON: true },
            userId: auth.user?.userId,
          }),
        ).unwrap();
        const cybotId = writeResult.id;

        await createNewDialog({ cybots: [cybotId] });

        onClose();
      } catch (error) {
        console.error("Error creating Cybot:", error);
      }
    },
    [dispatch, auth.user?.userId, createNewDialog, onClose],
  );

  const handleFormSubmit = handleSubmit(onSubmit, (errors) =>
    console.log("Form validation failed", errors),
  );

  return (
    <FormContainer>
      <FormTitle>{t("createCybot")}</FormTitle>
      <form onSubmit={handleFormSubmit}>
        <FormFieldComponent
          label={t("cybotName")}
          name="name"
          register={register}
          errors={errors}
          required={t("cybotNameRequired")}
        />

        <FormField>
          <Label htmlFor="provider">{t("provider")}:</Label>
          <Select id="provider" {...register("provider")}>
            {providerOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField>
          <Label htmlFor="model">{t("model")}:</Label>
          <Select id="model" {...register("model")}>
            {models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name}
                {model.hasVision && ` (${t("supportsVision")})`}
              </option>
            ))}
          </Select>
        </FormField>

        <FormFieldComponent
          label={t("apiKeyField")}
          name="apiKey"
          type="password"
          register={register}
          errors={errors}
        />
        <FormField>
          <Label>{t("useServerProxy")}:</Label>
          <ToggleSwitch
            checked={useServerProxy}
            onChange={(checked) => setValue("useServerProxy", checked)}
            ariaLabelledby="server-proxy-label"
          />
        </FormField>

        <FormFieldComponent
          label={t("prompt")}
          name="prompt"
          register={register}
          errors={errors}
          as="textarea"
        />

        <FormFieldComponent
          label={t("greetingMessage")}
          name="greeting"
          register={register}
          errors={errors}
        />

        <FormFieldComponent
          label={t("selfIntroduction")}
          name="introduction"
          register={register}
          errors={errors}
          as="textarea"
        />

        <ToolSelector register={register} />

        <FormField>
          <Label>{t("private")}:</Label>
          <ToggleSwitch
            checked={isPrivate}
            onChange={(checked) => setValue("isPrivate", checked)}
            ariaLabelledby="private-label"
          />
        </FormField>

        <FormField>
          <Label>{t("encrypted")}:</Label>
          <ToggleSwitch
            checked={isEncrypted}
            onChange={(checked) => setValue("isEncrypted", checked)}
            ariaLabelledby="encrypted-label"
          />
        </FormField>

        <Button
          type="submit"
          disabled={isSubmitting || isDialogLoading}
          style={{ width: "100%", padding: "10px", marginTop: "20px" }}
        >
          {t("createCybot")}
        </Button>
      </form>
    </FormContainer>
  );
};

export default withTranslations(CreateCybot, ["ai"]);
