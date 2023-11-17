import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from '@reduxjs/toolkit';
import { useAuth } from 'app/hooks';
import { FormField } from 'components/Form/FormField';
import { useWriteMutation } from 'database/services';
import i18next from 'i18n';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'ui/Button';

import allTranslations from '../aiI18n';
import { schema, fields } from '../dsl';
Object.keys(allTranslations).forEach((lang) => {
  const translations = allTranslations[lang].translation;
  i18next.addResourceBundle(lang, 'translation', translations, true, true);
});

const CreateChatRobotForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [write, { isLoading: isWriteLoading, error: writeError }] =
    useWriteMutation();

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
      data: { ...data, type: 'chatRobot' },
      flags: { isJSON: true },
      userId: auth.user?.userId,
      customId: data.path ? data.path : nanoid(),
    };

    try {
      const result = await write(requestBody).unwrap();
      navigate(`/chat?chatId=${result.dataId}`);
    } catch (error) {
      setError(error.data?.message || error.status); // 可以直接设置错误状态
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {fields.map((field) => (
        <div className={'flex flex-col mb-4'} key={field.id}>
          <label
            htmlFor={field.id}
            className={'block text-sm font-medium text-gray-700 mb-1'}
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

      {error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        size="medium"
        loading={isWriteLoading}
      >
        {t('startConfiguringYourRobot')}
      </Button>
    </form>
  );
};

export default CreateChatRobotForm;
