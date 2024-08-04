import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { DataType } from "create/types";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useQueryData } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import ToggleSwitch from "render/ui/ToggleSwitch";
import withTranslations from "i18n/withTranslations";
import {
  FormContainer,
  FormTitle,
  FormFieldComponent,
  SubmitButton,
  FormField,
  Label,
  Select,
} from "render/CommonFormComponents";
import { modelEnum } from "../llm/models";

interface CreateCybotProps {
  onClose: () => void;
}

const CreateCybot: React.FC<CreateCybotProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { isLoading: isDialogLoading, createDialog } = useCreateDialog();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");

  // LLM query configuration
  const queryConfig = {
    queryUserId: auth.user?.userId,
    options: {
      isJSON: true,
      limit: 100,
      condition: {
        type: DataType.LLM,
      },
    },
  };

  const { data: llmData, isLoading: isLLMLoading } = useQueryData(queryConfig);

  // Prepare combined model options
  const modelOptions = useMemo(() => {
    const predefinedOptions = Object.entries(modelEnum).map(([key, value]) => ({
      value: `predefined:${value}`,
      label: key,
    }));

    const userLLMOptions = llmData
      ? llmData.map((llm: any) => ({
          value: `user:${llm.id}`,
          label: `${llm.name} (${llm.model})`,
        }))
      : [];

    return [
      { label: t("predefinedModels"), options: predefinedOptions },
      { label: t("userLLMs"), options: userLLMOptions },
    ];
  }, [llmData, t]);

  const onSubmit = async (data: any) => {
    console.log(data);
    const [modelType, modelValue] = data.model.split(":");
    const modelData =
      modelType === "predefined"
        ? { model: modelValue }
        : { llmId: modelValue };

    try {
      const writeChatRobotAction = await dispatch(
        write({
          data: {
            type: DataType.Cybot,
            ...data,
            ...modelData,
          },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );
      const cybotId = writeChatRobotAction.payload.id;
      await createDialog({ cybots: [cybotId] });
      onClose();
    } catch (error) {
      console.error("Error creating Cybot:", error);
    }
  };

  return (
    <FormContainer>
      <FormTitle>{t("createCybot")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormFieldComponent
          label={t("cybotName")}
          name="name"
          register={register}
          errors={errors}
          required={t("cybotNameRequired")}
        />

        <FormFieldComponent
          label={t("greetingMessage")}
          name="greeting"
          register={register}
          errors={errors}
          required={t("greetingRequired")}
        />

        <FormFieldComponent
          label={t("selfIntroduction")}
          name="introduction"
          register={register}
          errors={errors}
          required={t("introductionRequired")}
          as="textarea"
        />

        <FormField>
          <Label htmlFor="model">{t("model")}:</Label>
          <Select
            id="model"
            {...register("model", { required: t("modelRequired") })}
            disabled={isLLMLoading}
          >
            <option value="">{t("selectModel")}</option>
            {modelOptions.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          {errors.model && <ErrorMessage>{errors.model.message}</ErrorMessage>}
        </FormField>

        <FormFieldComponent
          label={t("prompt")}
          name="prompt"
          register={register}
          errors={errors}
          as="textarea"
        />

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

        <SubmitButton type="submit" disabled={isLLMLoading || isDialogLoading}>
          {t("createCybot")}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default withTranslations(CreateCybot, ["ai"]);
