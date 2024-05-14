import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "@reduxjs/toolkit";
import { useAuth } from "app/hooks";
import { FormField } from "components/Form/FormField";
import { useWriteMutation } from "database/services";
import i18next from "i18n";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "ui/Button";

import allTranslations from "../aiI18n";
import { schema, fields } from "../schema";

Object.keys(allTranslations).forEach((lang) => {
  const translations = allTranslations[lang].translation;
  i18next.addResourceBundle(lang, "translation", translations, true, true);
});

const CreateChatRobot = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [write, { isLoading: isWriteLoading, error: writeError }] =
    useWriteMutation();

  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
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
      setIsSuccess(result.dataId); // 可以直接设置成功状态
    } catch (error) {
      setError(error.data?.message || error.status); // 可以直接设置错误状态
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full rounded-lg bg-white p-4 shadow-lg sm:w-4/5 sm:p-6 md:w-3/5 lg:w-1/2 lg:p-8 xl:w-3/5 2xl:w-1/2"
      >
        <h2 className="mb-4 text-xl font-bold">{t("createRobot")}</h2>

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
        {isSuccess ? (
          <Button
            variant="primary"
            size="medium"
            onClick={() => navigate(`/chat?chatId=${isSuccess}`)} // 假设 isSuccess 存储了新创建的聊天机器人的 ID
          >
            {t("startChattingWithYourRobot")}
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={isSuccess} // 如果成功，则禁用按钮
          >
            {t("startConfiguringYourRobot")}
          </Button>
        )}
      </form>
    </div>
  );
};

export default CreateChatRobot;
