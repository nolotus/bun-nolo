import { zodResolver } from '@hookform/resolvers/zod';
import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { FormField } from 'components/Form/FormField';
import { Flags } from 'core/prefix';
import { writeData } from 'database/client/write';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const customResolver = (schema, formDSL) => {
  return async (values, context, options) => {
    // 先使用DSL来转换数值类型字段
    const convertedValues = Object.keys(values).reduce((acc, key) => {
      if (formDSL[key] && formDSL[key].type === 'number') {
        acc[key] = Number(values[key]);
      } else {
        acc[key] = values[key];
      }
      return acc;
    }, {});

    // 然后执行基本的Zod验证
    return zodResolver(schema)(convertedValues, context, options);
  };
};

const formDSL = {
  typeOfLocation: {
    type: 'enum',
    values: ['Digital Nomad Space', 'Guesthouse', 'Rental Property'],
  },
  locationName: {
    type: 'string',
    min: 1,
  },
  locationDescription: {
    type: 'string',
    min: 1,
  },
  environmentRating: {
    type: 'number',
    min: 1,
    max: 5,
  },
  facilities: {
    type: 'array',
    values: ['Wi-Fi', 'Gym', 'Conference Room'], // 根据你的需求调整这些值
  },
  image: {
    type: 'file',
  },
};

const NomadSpotSchema = createZodSchemaFromDSL(formDSL);
const CreateNomadSpot: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const fields = createFieldsFromDSL(formDSL);
  let navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: customResolver(NomadSpotSchema, formDSL),
  });

  const onSubmit = async (data) => {
    console.log('Submitted data:', data);
    try {
      const flags: Flags = {
        isJSON: true,
      };
      const customId = 'I7JVK36F'; // 你的自定义ID

      const responseData = await writeData(
        { type: 'nomadspots', data },
        flags,
        customId,
      );
      navigate(`/${responseData.dataId}`);
    } catch (error) {
      setError(error.message); // 处理错误逻辑，例如设置错误信息
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white w-96 rounded-lg shadow-lg p-8"
        >
          <h2 className="text-xl font-bold mb-4">{t('createNomadSpot')}</h2>
          {fields.map((field) => (
            <FormField
              key={field.id}
              id={field.id}
              register={register}
              errors={errors}
              label={field.label}
              type={field.type}
              options={field.options}
            />
          ))}

          {/* 图像上传 */}
          <label htmlFor="image">{t('imageUpload')}</label>
          <input type="file" {...register('image')} />

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

export default CreateNomadSpot;
