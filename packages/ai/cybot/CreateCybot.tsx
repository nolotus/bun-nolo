// CreateCybot.tsx
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { DataType } from "create/types";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import ToggleSwitch from "render/ui/ToggleSwitch";
import ModelSelector from "ai/llm/ModelSelect";
import withTranslations from "i18n/withTranslations";
import {
  FormContainer,
  FormTitle,
  FormField,
  Label,
  ErrorMessage,
  SubmitButton,
  FormFieldComponent,
} from "render/CommonFormComponents";
import ToolSelector from "../tools/ToolSelector";

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
    },
  });

  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");

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
        await createNewDialog({ cybots: [cybotId] });
        console.log("Dialog created successfully");

        onClose();
      } catch (error) {
        console.error("Error creating Cybot:", error);
      }
    },
    [dispatch, auth.user?.userId, createNewDialog, onClose],
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

  return (
    <FormContainer>
      <FormTitle>{t("createCybot")}</FormTitle>
      <form onSubmit={(e) => handleFormSubmit(e)}>
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

        <ModelSelector
          value={watch("model")}
          onChange={(value) => setValue("model", value)}
          disabled={isSubmitting}
        />

        <FormFieldComponent
          label={t("prompt")}
          name="prompt"
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

        <SubmitButton
          type="submit"
          disabled={isSubmitting || isDialogLoading}
          onClick={(e) => {
            e.preventDefault();
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
