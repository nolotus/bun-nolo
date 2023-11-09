import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from 'app/hooks';
import { storeTokens } from 'auth/client/token';
import { parseToken } from 'auth/token';
import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { FormField } from 'components/Form/FormField';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'ui';
import { userRegister } from 'user/userSlice';

import { handleSignup } from '../client/signUp';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = (token: string) => {
    storeTokens(token);
    const user = parseToken(token);
    dispatch(userRegister(user));
  };

  const onSubmit = async (user) => {
    try {
      setLoading(true);
      const { token } = await handleSignup(user);
      await signup(token);
      navigate('/welcome');
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const userDefinition = {
    username: { type: 'string' },
    password: { type: 'string' },
  };
  const userFormSchema = createZodSchemaFromDSL(userDefinition);
  const fields = createFieldsFromDSL(userDefinition);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });
  return (
    <div>
      <div className=" flex items-center justify-center ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white w-96 rounded-lg shadow-lg p-8"
        >
          <h2 className="text-xl font-bold mb-4">{t('signup')}</h2>
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col mb-4">
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t(field.label)}
              </label>
              <FormField
                {...field}
                key={field.id}
                register={register}
                errors={errors}
              />
            </div>
          ))}

          {error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}
          {loading ? (
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              disabled
            >
              <Icon name="spinner" />
              {t('submitting')}
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              {t('submit')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
