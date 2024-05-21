import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "@reduxjs/toolkit";
import { useAuth } from "app/hooks";
import { createFieldsFromDSL } from "components/Form/createFieldsFromDSL";
import { FormField } from "components/Form/FormField";
import { createZodSchemaFromDSL } from "database/schema/createZodSchemaFromDSL";
import { useWriteMutation } from "database/services";
import i18next from "i18n";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "ui/Button";

import allTranslations from "../aiI18n";
import { createDsl } from "../schema";
const fields = createFieldsFromDSL(createDsl);
const schema = createZodSchemaFromDSL(createDsl);
Object.keys(allTranslations).forEach((lang) => {
  const translations = allTranslations[lang].translation;
  i18next.addResourceBundle(lang, "translation", translations, true, true);
});

const CreateChatRobotForm = ({ onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [write, { isLoading: isWriteLoading }] = useWriteMutation();

  const [error, setError] = useState(null);
  const auth = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const requestBody = {
      data: { ...data, type: "chatRobot" },
      flags: { isJSON: true },
      userId: auth.user?.userId,
      customId: data.path ? data.path : nanoid(),
    };

    try {
      const result = await write(requestBody).unwrap();
      navigate(`/chat?dialogId=${result.noloId}`);
      onClose();
    } catch (error) {
      setError(error.data?.message || error.status); // 可以直接设置错误状态
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {fields.map((field) => (
        <div className={"mb-4 flex flex-col"} key={field.id}>
          <label
            htmlFor={field.id}
            className={"mb-1 block text-sm font-medium text-gray-700"}
          >
            {t(field.label)}
          </label>
          <FormField
            {...field}
            key={field.id}
            errors={errors}
            register={register}
          />
        </div>
      ))}

      {error && <p className="mb-2 mt-2 text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        size="medium"
        loading={isWriteLoading}
      >
        {t("startConfiguringYourRobot")}
      </Button>
      <div className="mt-4">
        <NavLink
          to="/create/chat-robot"
          className="text-blue-600 hover:text-blue-800"
        >
          {t("configureDetailedSettings")}
        </NavLink>
      </div>
    </form>
  );
};

export default CreateChatRobotForm;
