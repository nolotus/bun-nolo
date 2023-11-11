import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAuth } from 'app/hooks';
import { updateChatConfig } from 'chat/chatSlice';
import { FormField } from 'components/Form/FormField';
import { useUpdateEntryMutation } from 'database/services'; // 导入新的 mutation 钩子
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/Button';

import { fields, schema } from '../dsl';
const ChatConfigForm = ({ initialValues, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [updateEntry] = useUpdateEntryMutation(); // 初始化 mutation 钩子

  const onSubmit = async (data) => {
    try {
      const result = await updateEntry({
        entryId: initialValues.id,
        data,
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
        <div className={'flex flex-col mb-4'} key={field.id}>
          <label
            htmlFor={field.id}
            className={'block text-sm font-medium text-gray-700 mb-1'}
          >
            {t(field.label)}
          </label>
          <FormField {...field} errors={errors} register={register} />
        </div>
      ))}
      <Button type="submit">{t('update')}</Button>
    </form>
  );
};

export default ChatConfigForm;
