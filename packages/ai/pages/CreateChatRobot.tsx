import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "auth/useAuth";
import { FormField } from "render/ui/Form/FormField";
import i18next from "i18n";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "render/ui/Button";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { createDialog } from "chat/dialog/dialogSlice";

import allTranslations from "../aiI18n";
import { schema, fields } from "../schema";

Object.keys(allTranslations).forEach((lang) => {
  const translations = allTranslations[lang].translation;
  i18next.addResourceBundle(lang, "translation", translations, true, true);
});

const CreateChatRobot = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const writeChatRobotAction = await dispatch(
        write({
          data: { type: "chatRobot", ...data },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );
      const llmId = writeChatRobotAction.payload.id;
      const writeDialogAction = await dispatch(createDialog(llmId));
      console.log("writeDialogAction", writeDialogAction);
      const result = writeDialogAction.payload;
      navigate(`/chat?dialogId=${result.id}`);
      setIsLoading(false);
    } catch (error) {
      setError(error.data?.message || error.status); // 可以直接设置错误状态
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full rounded-lg p-4  sm:w-4/5 sm:p-6 md:w-3/5 lg:w-1/2 lg:p-8 xl:w-3/5 2xl:w-1/2"
      >
        <h2 className="mb-4 text-xl font-bold">{t("createRobot")}</h2>

        {fields.map((field) => (
          <div className={"mb-4 flex flex-col"} key={field.id}>
            <label htmlFor={field.id} className={"mb-1 block"}>
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

        <Button type="submit" variant="primary" size="medium">
          {t("startConfiguringYourRobot")}
        </Button>
      </form>
    </div>
  );
};

export default CreateChatRobot;
