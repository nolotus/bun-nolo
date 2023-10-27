import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { fields, schema } from "../dsl";
import { FormField } from "components/Form/FormField";
import { useStore } from "app";
import { Button } from "ui/Button";
import { updateData } from "database/client/update";
import { useAuth } from "app/hooks";

const ChatConfigForm = ({ initialValues, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const onSubmit = async (data) => {
    await updateData(auth.user?.userId, data, id);
    onClose(); // 关闭弹窗
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [reset, initialValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => (
        <FormField
          {...field}
          errors={errors}
          register={register}
          key={field.id}
        />
      ))}
      <Button type="submit">{t("update")}</Button>
    </form>
  );
};

export default ChatConfigForm;
