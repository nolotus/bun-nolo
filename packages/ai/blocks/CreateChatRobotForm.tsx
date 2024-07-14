import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "auth/useAuth";
import { createFieldsFromDSL } from "render/ui/Form/createFieldsFromDSL";
import { FormField } from "render/ui/Form/FormField";
import { createZodSchemaFromDSL } from "database/schema/createZodSchemaFromDSL";
import i18next from "i18n";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "render/ui/Button";

import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";

import { createDsl } from "../llm/schema";
import allTranslations from "../aiI18n";
import { DataType } from "create/types";

const fields = createFieldsFromDSL(createDsl);
const schema = createZodSchemaFromDSL(createDsl);

Object.keys(allTranslations).forEach((lang) => {
  const translations = allTranslations[lang].translation;
  i18next.addResourceBundle(lang, "translation", translations, true, true);
});

const CreateChatRobotForm = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createDialog } = useCreateDialog();
  const [isWriteLoading, setWriting] = useState(false);

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
    try {
      setWriting(true);
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
      setWriting(false);
    } catch (error) {
      setWriting(false);
      setError(error.data?.message || error.status); // 可以直接设置错误状态
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {fields.map((field) => (
        <div className={"mb-4 flex flex-col"} key={field.id}>
          <label
            htmlFor={field.id}
            className={"mb-1 block text-sm font-medium "}
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
      <Button type="submit" loading={isWriteLoading}>
        {t("create")}
      </Button>
    </form>
  );
};

export default CreateChatRobotForm;
