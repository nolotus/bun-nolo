// ChatConfigForm.js

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { FormField } from "render/ui/Form/FormField";
import { useUpdateEntryMutation } from "database/services";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "render/ui/Button";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

import { editSchema, editFields } from "../llm/schema";

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
    const chatRobotConfig = { ...data, type: "chatRobot" };
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
    resolver: zodResolver(editSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
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
    width: theme.getResponsiveLabelWidth(screenWidth),
  };

  const inputContainerStyle = {
    width: theme.getResponsiveInputWidth(screenWidth),
  };

  const buttonStyle = {
    width: "100%",
    padding: theme.button.padding,
    marginTop: theme.button.marginTop,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {editFields.map((field) => (
        <div style={fieldContainerStyle} key={field.id}>
          <label htmlFor={field.id} style={labelStyle}>
            {t(field.label)}
          </label>
          <div style={inputContainerStyle}>
            <FormField {...field} errors={errors} register={register} />
          </div>
        </div>
      ))}
      <Button type="submit" style={buttonStyle}>
        {t("update")}
      </Button>
    </form>
  );
};

export default EditCybot;
