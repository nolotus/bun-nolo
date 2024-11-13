// CreateLLM.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import withTranslations from "i18n/withTranslations";

import { DataType } from "create/types";
import { useNavigate } from "react-router-dom";
import {
  FormContainer,
  FormTitle,
  FormFieldComponent,
  SubmitButton,
} from "render/CommonFormComponents";
import { LLMFormData } from "./types";
import { defaultAPIs, apiStyleOptions } from "./config";

const CreateLLM: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<LLMFormData>();

  const apiStyle = watch("apiStyle");

  useEffect(() => {
    if (apiStyle && defaultAPIs[apiStyle]) {
      setValue("api", defaultAPIs[apiStyle]);
    }
  }, [apiStyle, setValue]);

  const onSubmit = async (data: LLMFormData) => {
    console.log(data);
    try {
      const writeLLMAction = await dispatch(
        write({
          data: { type: DataType.LLM, ...data },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );
      const llmId = writeLLMAction.payload.id;
      navigate(`/${llmId}`);
    } catch (error) {
      console.error("创建 LLM 时出错:", error);
    }
  };

  const providerOptions = [
    { value: "deepinfra", label: "DeepInfra" },
    { value: "firework", label: "Firework" },
    { value: "provider1", label: "提供商1" },
    { value: "provider2", label: "提供商2" },
    // 根据需要添加更多提供商
  ];

  return (
    <FormContainer>
      <FormTitle>{t("createLLM")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormFieldComponent
          label={t("llmName")}
          name="name"
          register={register}
          errors={errors}
          required
        />
        <FormFieldComponent
          label={t("provider")}
          name="provider"
          register={register}
          errors={errors}
          required
          as="select"
          options={providerOptions}
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
        <SubmitButton type="submit">{t("createLLM")}</SubmitButton>
      </form>
    </FormContainer>
  );
};

export default withTranslations(CreateLLM, ["ai"]);
