import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { DataType } from "create/types";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { globalStyles } from "render/ui/formStyle";
import withTranslations from "i18n/withTranslations";

import { modelEnum } from "../llm/models";

const CreateLLM = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const provider = watch("provider");

  useEffect(() => {
    if (provider === "ollama") {
      setValue("api", "http://localhost:11434/api/chat");
    }
  }, [provider, setValue]);

  const onSubmit = async (data) => {
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
      // 这里可以添加创建LLM后的额外操作
    } catch (error) {
      // 错误处理
    }
  };

  return (
    <div style={globalStyles.formStyle}>
      <h2 style={{ textAlign: "center", color: "#333" }}>{t("createLLM")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" style={globalStyles.labelStyle}>
            {t("llmName")}:
          </label>
          <input
            id="name"
            style={globalStyles.inputStyle}
            {...register("name", { required: t("llmNameRequired") })}
          />
          {errors.name && (
            <p style={globalStyles.errorStyle}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="provider" style={globalStyles.labelStyle}>
            {t("llmProvider")}:
          </label>
          <input
            id="provider"
            style={globalStyles.inputStyle}
            {...register("provider", { required: t("llmProviderRequired") })}
          />
          {errors.provider && (
            <p style={globalStyles.errorStyle}>{errors.provider.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="api" style={globalStyles.labelStyle}>
            {t("llmAPI")}:
          </label>
          <input
            id="api"
            style={globalStyles.inputStyle}
            {...register("api", { required: t("llmAPIRequired") })}
          />
          {errors.api && (
            <p style={globalStyles.errorStyle}>{errors.api.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="keyName" style={globalStyles.labelStyle}>
            {t("apiKeyName")}:
          </label>
          <input
            id="keyName"
            style={globalStyles.inputStyle}
            {...register("keyName")}
          />
        </div>

        <div>
          <label htmlFor="model" style={globalStyles.labelStyle}>
            {t("model")}:
          </label>
          <select
            id="model"
            style={globalStyles.inputStyle}
            {...register("model", { required: t("modelRequired") })}
          >
            <option value="">{t("selectModel")}</option>
            {Object.entries(modelEnum).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </select>
          {errors.model && (
            <p style={globalStyles.errorStyle}>{errors.model.message}</p>
          )}
        </div>

        <button type="submit" style={globalStyles.buttonStyle}>
          {t("createLLM")}
        </button>
      </form>
    </div>
  );
};

export default withTranslations(CreateLLM, ["ai"]);
