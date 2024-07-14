import React from "react";
import { useForm } from "react-hook-form";
import { DataType } from "create/types";
import i18next from "i18n";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import ToggleSwitch from "render/ui/ToggleSwitch";

import { modelEnum } from "../llm/models";
import allTranslations from "../aiI18n";

Object.keys(allTranslations).forEach((lang) => {
  const translations = allTranslations[lang].translation;
  i18next.addResourceBundle(lang, "translation", translations, true, true);
});
const CreateCybot = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const { isLoading, createDialog } = useCreateDialog();
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
      createDialog({ cybots: [cybotId] });
    } catch (error) {
      // setError(error.data?.message || error.status); // 可以直接设置错误状态
    }
  };

  const formStyle = {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    margin: "8px 0",
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: "5px",
    display: "block",
  };

  const errorStyle = {
    color: "red",
    fontSize: "0.8em",
  };

  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Create a New Cybot</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" style={labelStyle}>
            Cybot Name:
          </label>
          <input
            id="name"
            style={inputStyle}
            {...register("name", { required: "Cybot name is required" })}
          />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="greeting" style={labelStyle}>
            Greeting Message:
          </label>
          <input
            id="greeting"
            style={inputStyle}
            {...register("greeting", {
              required: "Greeting message is required",
            })}
          />
          {errors.greeting && (
            <p style={errorStyle}>{errors.greeting.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="introduction" style={labelStyle}>
            Self Introduction:
          </label>
          <textarea
            id="introduction"
            style={{ ...inputStyle, height: "100px" }}
            {...register("introduction", {
              required: "Self introduction is required",
            })}
          />
          {errors.introduction && (
            <p style={errorStyle}>{errors.introduction.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" style={labelStyle}>
            Model:
          </label>
          <select
            id="model"
            style={inputStyle}
            {...register("model", { required: "Model selection is required" })}
          >
            <option value="">Select a model</option>
            {Object.entries(modelEnum).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </select>
          {errors.model && <p style={errorStyle}>{errors.model.message}</p>}
        </div>

        <div>
          <label htmlFor="prompt" style={labelStyle}>
            Prompt:
          </label>
          <textarea
            id="prompt"
            style={{ ...inputStyle, height: "100px" }}
            {...register("prompt")}
          />
          {errors.prompt && <p style={errorStyle}>{errors.prompt.message}</p>}
        </div>
        <div style={{ marginTop: "20px" }}>
          <label
            style={{
              ...labelStyle,
              display: "inline-block",
              marginRight: "10px",
            }}
          >
            Private:
          </label>
          <ToggleSwitch
            checked={isPrivate}
            onChange={(checked) => setValue("isPrivate", checked)}
            ariaLabelledby="private-label"
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <label
            style={{
              ...labelStyle,
              display: "inline-block",
              marginRight: "10px",
            }}
          >
            Encrypted:
          </label>
          <ToggleSwitch
            checked={isEncrypted}
            onChange={(checked) => setValue("isEncrypted", checked)}
            ariaLabelledby="encrypted-label"
          />
        </div>
        <button
          type="submit"
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create Cybot
        </button>
      </form>
    </div>
  );
};

export default CreateCybot;
