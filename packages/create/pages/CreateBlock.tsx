import { zodResolver } from '@hookform/resolvers/zod';
import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { FormField } from 'components/Form/FormField';
import { handleError } from 'database/client/handleError';
import { writeData } from 'database/client/write';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateBlock: React.FC = () => {
  const location = useLocation();
  const dsl = location.state?.dsl;
  const BlockFormSchema = createZodSchemaFromDSL(dsl);
  const fields = createFieldsFromDSL(dsl);
  const { t } = useTranslation();
  let navigate = useNavigate();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(BlockFormSchema),
  });
  const onSubmit = (page, handleUnauthorized) => {
    writeData(page.content, { isUrlSafe: true }, page.path)
      .then((responseData) => {
        navigate(`/${responseData.dataId}`);
      })
      .catch((error) => {
        const message = handleError(error, handleUnauthorized);
        setError(message);
      });
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white w-96 rounded-lg shadow-lg p-8"
        >
          <h2 className="text-xl font-bold mb-4">{t('createBlock')}</h2>
          {fields.map((field) => (
            <FormField
              key={field.id}
              {...field}
              errors={errors}
              register={register}
            />
          ))}
          {error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlock;
