import { zodResolver } from '@hookform/resolvers/zod';
import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { FormField } from 'components/Form/FormField';
import { handleError } from 'database/client/handleError';
import { writeData } from 'database/client/write';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'ui';

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
const CreateType = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showInput, setShowInput] = useState(false);
  console.log('showInput', showInput);
  const [newField, setNewField] = useState({ keyname: '', type: 'string' });
  const [formDSL, setFormDSL] = useState({
    path: {
      type: 'string',
      min: 1,
    },
    name: {
      type: 'string',
      min: 1,
    },
  });

  const schema = createZodSchemaFromDSL(formDSL);
  const fields = createFieldsFromDSL(formDSL);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: customResolver(schema, formDSL),
  });

  const onSubmit = (data, handleUnauthorized) => {
    console.log('formDSL', formDSL);

    const formattedData = {
      type: 'blockTemplate',
      name: data.name, // 假设你的表单有一个名为 "name" 的字段
      typeId: 'blockTemplate', // 这里是固定的 type 名称
      dsl: formDSL, // 当前的 DSL
      // ... 其他你觉得需要的字段
    };

    writeData(formattedData, { isJSON: true }, data.path)
      .then((responseData) => {
        navigate(`/${responseData.dataId}`);
      })
      .catch((err) => {
        const message = handleError(err, handleUnauthorized);
        setError(message);
      });
  };

  const addNewField = () => {
    console.log('Adding new field:', newField); // 添加日志
    setFormDSL((prevDSL) => ({
      ...prevDSL,
      [newField.keyname]: {
        type: newField.type,
        min: 1,
      },
    }));
    setShowInput(false);
  };
  const willShowInput = () => {
    console.log('1');
    setShowInput(true);
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
          {showInput && (
            <div className="my-2">
              <input
                type="text"
                placeholder="Keyname"
                value={newField.keyname}
                onChange={(e) =>
                  setNewField({ ...newField, keyname: e.target.value })
                }
              />
              <select
                value={newField.type}
                onChange={(e) =>
                  setNewField({ ...newField, type: e.target.value })
                }
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                {/* Add more types as needed */}
              </select>
              <button onClick={addNewField}>Add</button>
            </div>
          )}
          <div onClick={willShowInput}>
            <Icon name="plus" />
          </div>
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

export default CreateType;
