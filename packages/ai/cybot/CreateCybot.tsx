import React from "react";
import { useForm } from "react-hook-form";
import { DataType } from "create/types";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import ToggleSwitch from "render/ui/ToggleSwitch";
import { globalStyles } from "render/ui/formStyle";
import withTranslations from "i18n/withTranslations";

import { modelEnum } from "../llm/models";

const CreateCybot = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { isLoading, createDialog } = useCreateDialog();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const writeChatRobotAction = await dispatch(
        write({
          data: { type: DataType.Cybot, ...data },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );
      const cybotId = writeChatRobotAction.payload.id;
      await createDialog({ cybots: [cybotId] });
      onClose();
    } catch (error) {
      // 错误处理
    }
  };

  return (
    <div style={globalStyles.formStyle}>
      <h2 style={{ textAlign: "center" }}>{t("createCybot")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" style={globalStyles.labelStyle}>
            {t("cybotName")}:
          </label>
          <input
            id="name"
            style={globalStyles.inputStyle}
            {...register("name", { required: t("cybotNameRequired") })}
          />
          {errors.name && (
            <p style={globalStyles.errorStyle}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="greeting" style={globalStyles.labelStyle}>
            {t("greetingMessage")}:
          </label>
          <input
            id="greeting"
            style={globalStyles.inputStyle}
            {...register("greeting", { required: t("greetingRequired") })}
          />
          {errors.greeting && (
            <p style={globalStyles.errorStyle}>{errors.greeting.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="introduction" style={globalStyles.labelStyle}>
            {t("selfIntroduction")}:
          </label>
          <textarea
            id="introduction"
            style={{ ...globalStyles.inputStyle, height: "100px" }}
            {...register("introduction", {
              required: t("introductionRequired"),
            })}
          />
          {errors.introduction && (
            <p style={globalStyles.errorStyle}>{errors.introduction.message}</p>
          )}
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

        <div>
          <label htmlFor="prompt" style={globalStyles.labelStyle}>
            {t("prompt")}:
          </label>
          <textarea
            id="prompt"
            style={{ ...globalStyles.inputStyle, height: "100px" }}
            {...register("prompt")}
          />
          {errors.prompt && (
            <p style={globalStyles.errorStyle}>{errors.prompt.message}</p>
          )}
        </div>

        <div style={globalStyles.toggleSwitchContainer}>
          <label style={globalStyles.toggleSwitchLabel}>{t("private")}:</label>
          <ToggleSwitch
            checked={isPrivate}
            onChange={(checked) => setValue("isPrivate", checked)}
            ariaLabelledby="private-label"
          />
        </div>

        <div style={globalStyles.toggleSwitchContainer}>
          <label style={globalStyles.toggleSwitchLabel}>
            {t("encrypted")}:
          </label>
          <ToggleSwitch
            checked={isEncrypted}
            onChange={(checked) => setValue("isEncrypted", checked)}
            ariaLabelledby="encrypted-label"
          />
        </div>

        <button type="submit" style={globalStyles.buttonStyle}>
          {t("createCybot")}
        </button>
      </form>
    </div>
  );
};

export default withTranslations(CreateCybot, ["ai"]);
