import React, { useEffect, useState } from "react";
import { useAppDispatch } from "app/hooks";
import { useUpdateEntryMutation } from "database/services";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "render/ui/Button";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { modelEnum } from "ai/llm/models";
import { DataType } from "create/types";

const EditCybot = ({ initialValues, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [updateEntry] = useUpdateEntryMutation();
  const theme = useSelector(selectTheme);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onSubmit = async (data) => {
    const chatRobotConfig = { ...data, type: DataType.Cybot };
    try {
      await updateEntry({
        entryId: initialValues.id,
        data: chatRobotConfig,
      }).unwrap();
      onClose();
    } catch (error) {
      // Handle error
    }
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
        <div style={fieldContainerStyle}>
          <label htmlFor="model" style={labelStyle}>
            {t("model")}
          </label>
          <div style={inputContainerStyle}>
            <select
              id="model"
              {...register("model", { required: "Model is required" })}
              style={{ width: "100%" }}
            >
              {Object.entries(modelEnum).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.model && <span>{errors.model.message}</span>}
          </div>
        </div>
      )}
      <Button type="submit" style={buttonStyle}>
        {t("update")}
      </Button>
    </form>
  );
};

export default EditCybot;
