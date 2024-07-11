import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { FormField } from "render/ui/Form/FormField";
import { useUpdateEntryMutation } from "database/services"; // 导入新的 mutation 钩子
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "render/ui/Button";

import { editSchema, editFields } from "../schema";
const ChatConfigForm = ({ initialValues, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [updateEntry] = useUpdateEntryMutation();

  const onSubmit = async (data) => {
    const chatRobotConfig = { ...data, type: "chatRobot" };
    try {
      const result = await updateEntry({
        entryId: initialValues.id,
        data: chatRobotConfig,
      }).unwrap();

      onClose(); // 关闭弹窗
    } catch (error) {}
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {editFields.map((field) => (
        <div
          className="mb-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-x-4 sm:space-y-0 md:space-x-6 lg:space-x-8 xl:space-x-10 2xl:space-x-12"
          key={field.id}
        >
          <label
            htmlFor={field.id}
            className="mb-2 block  sm:mb-0 sm:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6"
          >
            {t(field.label)}
          </label>
          <div className="w-full sm:w-2/3 lg:w-3/4 xl:w-4/5 2xl:w-5/6">
            <FormField {...field} errors={errors} register={register} />
          </div>
        </div>
      ))}
      <Button
        type="submit"
        className="w-full py-2  transition duration-300 ease-snappy sm:mt-3"
      >
        {t("update")}
      </Button>
    </form>
  );
};

export default ChatConfigForm;
