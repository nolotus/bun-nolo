import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from 'components/Form/FormField';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const CreateArticleForm = ({ schema, fields, onSubmit, errors }) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => (
        <FormField
          key={field.id}
          {...field}
          errors={errors}
          register={register}
        />
      ))}
      {errors && <p className="text-red-500 text-sm mt-2 mb-2">{errors}</p>}
      <button type="submit">{t('submit')}</button>
    </form>
  );
};
