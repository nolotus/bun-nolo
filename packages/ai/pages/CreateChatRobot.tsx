import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from 'app/hooks';
import { FormField } from 'components/Form/FormField';
import i18n from 'i18next';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'ui/Button';

import allTranslations from '../aiI18n';
import { schema, fields } from '../dsl';
import { createChatRobot } from '../services';
// Object.keys(allTranslations).forEach((lang) => {
//   const translations = allTranslations[lang].translation;
//   i18n.addResourceBundle(lang, 'translation', translations, true, true);
// });

const CreateChatRobot = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const onSubmit = (data: any) => {
    createChatRobot(data, setIsSuccess, setError, auth.user?.userId); // Make sure to implement this function
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-3/5 2xl:w-1/2 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8"
      >
        <h2 className="text-xl font-bold mb-4">{t('createRobot')}</h2>
        {fields.map((field) => (
          <FormField
            key={field.id}
            {...field}
            errors={errors}
            register={register}
          />
        ))}
        {error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}
        {isSuccess ? (
          <Button
            variant="primary"
            size="medium"
            onClick={() => navigate(`/chat?chatId=${isSuccess}`)} // 假设 isSuccess 存储了新创建的聊天机器人的 ID
          >
            {t('startChattingWithYourRobot')}
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={isSuccess} // 如果成功，则禁用按钮
          >
            {t('startConfiguringYourRobot')}
          </Button>
        )}
      </form>
    </div>
  );
};

export default CreateChatRobot;
