import React, { useState, useEffect } from "react";
import { useAppDispatch } from "app/hooks";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "render/ui/Button";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { DataType } from "create/types";
import ToggleSwitch from "render/ui/ToggleSwitch";
import useMediaQuery from "react-responsive";

import {
  FormField,
  Label,
  FormFieldComponent,
  Select,
} from "render/CommonFormComponents";
import { setData } from "database/dbSlice";

import { providerOptions, getModelsByProvider } from "../llm/providers";
import { Model } from "../llm/types";

import ToolSelector from "../tools/ToolSelector";
import { layout } from "render/styles/layout";

const QuickEditCybot = ({ initialValues, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useSelector(selectTheme);

  // 使用 useMediaQuery 来判断屏幕大小
  const isMobile = useMediaQuery({ maxWidth: theme.breakpoints[0] });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      ...initialValues,
      name: initialValues.name || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
      tools: initialValues.tools || [],
      isPrivate: initialValues.isPrivate || false,
      isEncrypted: initialValues.isEncrypted || false,
    },
  });

  const provider = watch("provider");

  const [models, setModels] = useState<Model[]>([]);
  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");
  const useServerProxy = watch("useServerProxy");

  // 监听provider变化以更新models
  useEffect(() => {
    const modelsList = getModelsByProvider(provider);
    setModels(modelsList);
    if (modelsList.length > 0) {
      setValue("model", modelsList[0].name);
    }
  }, [provider, setValue]);

  useEffect(() => {
    reset({
      ...initialValues,
      name: initialValues.name || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
      tools: initialValues.tools || [],
      isPrivate: initialValues.isPrivate || false,
      isEncrypted: initialValues.isEncrypted || false,
    });
  }, [reset, initialValues]);

  const onSubmit = async (data) => {
    const submitData = { ...data, type: DataType.Cybot };
    await dispatch(setData({ id: initialValues.id, data: submitData }));
    onClose();
  };

  // 样式部分调整
  const fieldContainerStyle = {
    marginBottom: theme.form.fieldSpacing,
    ...layout.flex,
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    gap: theme.spacing.small,
  };

  const labelStyle = {
    marginBottom: isMobile ? theme.spacing.small : 0,
    width: isMobile ? "100%" : "30%",
  };

  const inputContainerStyle = {
    width: isMobile ? "100%" : "70%",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={fieldContainerStyle}>
        <label htmlFor="name" style={labelStyle}>
          {t("cybotName")}
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

      <FormField>
        <Label htmlFor="provider">{t("provider")}:</Label>
        <Select id="provider" {...register("provider")}>
          {providerOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField>
        <Label htmlFor="model">{t("model")}:</Label>
        <Select id="model" {...register("model")}>
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
              {model.hasVision && ` (${t("supportsVision")})`}
            </option>
          ))}
        </Select>
      </FormField>

      <FormFieldComponent
        label={t("apiKeyField")}
        name="apiKey"
        type="password"
        register={register}
        errors={errors}
      />
      <FormField>
        <Label>{t("useServerProxy")}:</Label>
        <ToggleSwitch
          checked={useServerProxy}
          onChange={(checked) => setValue("useServerProxy", checked)}
          ariaLabelledby="server-proxy-label"
        />
      </FormField>

      <ToolSelector
        register={register}
        containerStyle={fieldContainerStyle}
        labelStyle={labelStyle}
        inputContainerStyle={inputContainerStyle}
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

      <Button
        type="submit"
        style={{ width: "100%", padding: "10px", marginTop: "20px" }}
      >
        {t("update")}
      </Button>
    </form>
  );
};

export default QuickEditCybot;
