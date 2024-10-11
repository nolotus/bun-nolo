// CreateCybot.tsx

import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { DataType } from "create/types";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useQueryData } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import ToggleSwitch from "render/ui/ToggleSwitch";
import {
  FormContainer,
  FormTitle,
  FormField,
  Label,
  Select,
  ErrorMessage,
  SubmitButton,
  FormFieldComponent,
} from "render/CommonFormComponents";

import withTranslations from "i18n/withTranslations";

import { modelEnum } from "ai/llm/models";

interface CreateCybotProps {
  onClose: () => void;
}

const CreateCybot: React.FC<CreateCybotProps> = ({ onClose }) => {
  console.log("CreateCybot component rendered");

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { isLoading: isDialogLoading, createDialog } = useCreateDialog();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
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

  console.log("Query config:", queryConfig);

  const { data: llmData, isLoading: isLLMLoading } = useQueryData(queryConfig);

  console.log("LLM data:", llmData);
  console.log("Is LLM loading:", isLLMLoading);

  // Prepare combined model options
  const modelOptions = useMemo(() => {
    console.log("Preparing model options");
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

    console.log("Predefined options:", predefinedOptions);
    console.log("User LLM options:", userLLMOptions);

    return [
      { label: t("predefinedModels"), options: predefinedOptions },
      { label: t("userLLMs"), options: userLLMOptions },
    ];
  }, [llmData, t]);

  console.log("Model options:", modelOptions);

  const onSubmit = useCallback(
    async (data: any) => {
      console.log("onSubmit function called");
      console.log("Form data submitted:", data);
      const [modelType, modelValue] = data.model.split(":");
      const modelData =
        modelType === "predefined"
          ? { model: modelValue }
          : { llmId: modelValue };

      console.log("Model data:", modelData);

      try {
        console.log("Dispatching write action");
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
        console.log("Write action result:", writeChatRobotAction);
        const cybotId = writeChatRobotAction.payload.id;
        console.log("Created Cybot ID:", cybotId);

        console.log("Creating dialog");
        await createDialog({ cybots: [cybotId] });
        console.log("Dialog created successfully");

        onClose();
      } catch (error) {
        console.error("Error creating Cybot:", error);
      }
    },
    [dispatch, auth.user?.userId, createDialog, onClose],
  );

  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log("Form submission started");
      onSubmit(data);
    },
    (errors) => {
      console.log("Form validation failed", errors);
    },
  );

  console.log("Current form errors:", errors);
  console.log("Is form submitting?", isSubmitting);

  return (
    <FormContainer>
      <FormTitle>{t("createCybot")}</FormTitle>
      <form
        onSubmit={(e) => {
          console.log("Form onSubmit triggered");
          handleFormSubmit(e);
        }}
      >
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
        />

        <FormFieldComponent
          label={t("selfIntroduction")}
          name="introduction"
          register={register}
          errors={errors}
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

        <SubmitButton
          type="submit"
          disabled={isLLMLoading || isDialogLoading || isSubmitting}
          onClick={(e) => {
            e.preventDefault();
            console.log("Submit button clicked");
            handleFormSubmit();
          }}
        >
          {t("createCybot")}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default withTranslations(CreateCybot, ["ai"]);
