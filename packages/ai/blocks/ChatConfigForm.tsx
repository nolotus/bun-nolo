import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from 'app/hooks';
import { updateChatConfig } from 'chat/chatSlice';
import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { FormField } from 'components/Form/FormField';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';
import { useUpdateEntryMutation } from 'database/services'; // 导入新的 mutation 钩子
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/Button';

import { ModelPriceEnum } from '../model/modelPrice';
export const editDsl = {
  name: {
    type: 'string',
    min: 1,
  },
  description: {
    type: 'textarea',
    min: 1,
  },

  replyRule: {
    type: 'textarea',
    min: 1,
    optional: true,
  },
  knowledge: {
    type: 'textarea',
    min: 1,
    optional: true,
  },
  model: {
    type: 'enum',
    values: Object.keys(ModelPriceEnum),
  },
  path: {
    type: 'string',
    min: 1,
    optional: true,
  },
};
const fields = createFieldsFromDSL(editDsl);
const schema = createZodSchemaFromDSL(editDsl);
const ChatConfigForm = ({ initialValues, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [updateEntry] = useUpdateEntryMutation(); // 初始化 mutation 钩子

  const onSubmit = async (data) => {
    const chatRobotConfig = { ...data, type: 'chatRobot' };
    try {
      const result = await updateEntry({
        entryId: initialValues.id,
        data: chatRobotConfig,
      }).unwrap();
      dispatch(updateChatConfig(result.data));
      onClose(); // 关闭弹窗
    } catch (error) {
      // 这里可以处理错误，例如显示一个错误信息
      console.error('Error updating entry:', error);
    }
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
        <div
          className="flex flex-col mb-4 space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-x-4 md:space-x-6 lg:space-x-8 xl:space-x-10 2xl:space-x-12 sm:space-y-0"
          key={field.id}
        >
          <label
            htmlFor={field.id}
            className="block text-neutral-700 font-medium mb-2 sm:mb-0 sm:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6"
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
        className="transition duration-300 ease-snappy w-full py-2 text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-md sm:w-auto sm:px-6 sm:rounded-md sm:py-3 sm:mt-3 md:px-8 md:py-4 lg:px-10 lg:py-4 xl:px-12 xl:py-5 2xl:px-14 2xl:py-5"
      >
        {t('update')}
      </Button>
    </form>
  );
};

export default ChatConfigForm;
