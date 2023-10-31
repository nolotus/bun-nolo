import { zodResolver } from '@hookform/resolvers/zod';
import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { FormField } from 'components/Form/FormField';
import { handleError } from 'database/client/handleError';
import { writeHashData } from 'database/client/write';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CreateBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const formDSL = {
    startTime: {
      type: 'time',
      subtype: 'date',
    },
    endTime: {
      type: 'time',
      subtype: 'date',
      readOnly: true,
    },
    weekday: {
      type: 'time',
      subtype: 'weekday',
    },
    createdBy: {
      type: 'string',
      min: 1,
    },
    belongUser: {
      type: 'string',
      min: 1,
    },
  };

  const schema = createZodSchemaFromDSL(formDSL);
  const fields = createFieldsFromDSL(formDSL);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    const startTime = new Date(data.startTime);
    const weekday = startTime.getDay(); // 0 (Sunday) - 6 (Saturday)

    const newData = {
      ...data,
      weekday,
      // 自动设置结束时间为开始时间后的一周
      endTime: new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000),
    };

    writeHashData({ ...newData, type: 'booking' }, { isObject: true })
      .then((responseData) => {
        navigate(`/${responseData.dataId}`);
      })
      .catch((err) => {
        const message = handleError(err);
        setError(message);
      });
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white w-96 rounded-lg shadow-lg p-8"
      >
        <h2 className="text-xl font-bold mb-4">{t('createBooking')}</h2>
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
  );
};

export default CreateBooking;
