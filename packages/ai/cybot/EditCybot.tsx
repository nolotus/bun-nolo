import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch } from "app/hooks";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "render/ui/Button";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { modelEnum } from "ai/llm/models";
import { DataType } from "create/types";
import {
  FormField,
  Label,
  Select,
  ErrorMessage,
} from "render/CommonFormComponents";
import { useQueryData } from "app/hooks/useQueryData";
import { useAuth } from "auth/useAuth";
import { setData } from "database/dbSlice";

const EditCybot = ({ initialValues, onClose }) => {
  console.log("initialValues", initialValues);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const theme = useSelector(selectTheme);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const onSubmit = async (data) => {
    const [modelType, modelValue] = data.model.split(":");
    const modelData =
      modelType === "user" ? { llmId: modelValue } : { model: data.model };
    const submitData = { ...data, ...modelData, type: DataType.Cybot };
    console.log("data", data);
    const action = await dispatch(
      setData({ id: initialValues.id, data: submitData }),
    );
    console.log("action", action);
    onClose();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      ...initialValues,
      name: initialValues.name || "",
      introduction: initialValues.introduction || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
    },
  });

  useEffect(() => {
    reset({
      ...initialValues,
      name: initialValues.name || "",
      introduction: initialValues.introduction || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
    });
  }, [reset, initialValues]);

  const fieldContainerStyle = {
    marginBottom: theme.form.fieldSpacing,
    display: "flex",
    flexDirection: screenWidth < theme.breakpoints[0] ? "column" : "row",
    alignItems: screenWidth < theme.breakpoints[0] ? "flex-start" : "center",
    gap: theme.spacing.small,
  };

  const labelStyle = {
    marginBottom: screenWidth < theme.breakpoints[0] ? theme.spacing.small : 0,
    width: (() => {
      const values = ["100%", "100%", "30%", "25%", "20%", "20%"];
      const breakpointIndex = theme.breakpoints.findIndex(
        (bp) => screenWidth < bp,
      );
      return values[
        breakpointIndex === -1 ? values.length - 1 : breakpointIndex
      ];
    })(),
  };
  const inputContainerStyle = {
    width: (() => {
      const values = ["100%", "100%", "70%", "75%", "80%", "80%"];
      const breakpointIndex = theme.breakpoints.findIndex(
        (bp) => screenWidth < bp,
      );
      return values[
        breakpointIndex === -1 ? values.length - 1 : breakpointIndex
      ];
    })(),
  };
  const buttonStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "20px",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={fieldContainerStyle}>
        <label htmlFor="name" style={labelStyle}>
          {t("name")}
        </label>
        <div style={inputContainerStyle}>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            style={{ width: "100%" }}
          />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
      </div>
      <div style={fieldContainerStyle}>
        <label htmlFor="introduction" style={labelStyle}>
          {t("introduction")}
        </label>
        <div style={inputContainerStyle}>
          <textarea
            id="introduction"
            style={{ width: "100%", minHeight: "100px" }}
            {...register("introduction")}
          />
          {errors.introduction && <span>{errors.introduction.message}</span>}
        </div>
      </div>
      <div style={fieldContainerStyle}>
        <label htmlFor="prompt" style={labelStyle}>
          {t("prompt")}
        </label>
        <div style={inputContainerStyle}>
          <textarea
            id="prompt"
            {...register("prompt")}
            style={{ width: "100%", minHeight: "100px" }}
          />
          {errors.prompt && <span>{errors.prompt.message}</span>}
        </div>
      </div>
      {initialValues.model && (
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
      )}
      <Button type="submit" style={buttonStyle}>
        {t("update")}
      </Button>
    </form>
  );
};

export default EditCybot;
