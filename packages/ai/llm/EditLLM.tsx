import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import withTranslations from "i18n/withTranslations";

import { useAppDispatch } from "app/hooks";
import { useForm } from "react-hook-form";
import { Dialog } from "render/ui/Dialog";
import {
  FormContainer,
  FormTitle,
  FormFieldComponent,
  SubmitButton,
} from "render/CommonFormComponents";
import { DataType } from "create/types";

import { setData } from "database/dbSlice";

const apiStyleOptions = ["ollama", "openai", "claude"];

const defaultAPIs = {
  ollama: "http://localhost:11434/api/chat",
  openai: "https://api.openai.com/v1/chat/completions",
  claude: "https://api.anthropic.com/v1/complete",
};

const EditLLM: React.FC<{
  initialValues;
  onClose: () => void;
}> = ({ initialValues, onClose }) => {
  const llmId = initialValues.id;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const apiStyle = watch("apiStyle");

  useEffect(() => {
    if (apiStyle && defaultAPIs[apiStyle] && !initialValues) {
      setValue("api", defaultAPIs[apiStyle]);
    }
  }, [apiStyle, setValue]);

  const onSubmit = async (data) => {
    const chatRobotConfig = { ...data, type: DataType.LLM };
    await dispatch(
      setData({
        id: llmId,
        data: chatRobotConfig,
      }),
    );
    onClose();
  };

  return (
    <Dialog isOpen={!!llmId} onClose={onClose} title={t("editLLM")}>
      <FormContainer>
        <FormTitle>{t("editLLM")}</FormTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormFieldComponent
            label={t("llmName")}
            name="name"
            register={register}
            errors={errors}
            required
          />
          <FormFieldComponent
            label={t("llmAPIStyle")}
            name="apiStyle"
            register={register}
            errors={errors}
            required
            as="select"
            options={apiStyleOptions.map((style) => ({
              value: style,
              label: style,
            }))}
          />
          <FormFieldComponent
            label={t("llmAPI")}
            name="api"
            register={register}
            errors={errors}
            required
          />
          <FormFieldComponent
            label={t("apiKeyName")}
            name="keyName"
            register={register}
            errors={errors}
          />
          <FormFieldComponent
            label={t("model")}
            name="model"
            register={register}
            errors={errors}
            required
          />
          <SubmitButton type="submit">{t("saveChanges")}</SubmitButton>
        </form>
      </FormContainer>
    </Dialog>
  );
};

export default withTranslations(EditLLM, ["ai"]);
