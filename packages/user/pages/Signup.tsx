import { zodResolver } from '@hookform/resolvers/zod';
import { PersonIcon, LockIcon } from '@primer/octicons-react';
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
import { Button } from 'ui';
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
    dispatch(userRegister({ user, token }));
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
    username: { type: 'string', min: 1 },
    password: { type: 'password', min: 6 },
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
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-lg p-10 bg-white rounded-lg shadow"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {t('signup')}
          </h2>
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
                register={register}
                errors={errors}
                icon={
                  field.id === 'username' ? (
                    <PersonIcon className="text-gray-400" size={24} />
                  ) : (
                    <LockIcon className="text-gray-400" size={24} />
                  )
                }
              />
            </div>
          ))}

          {error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="rounded-lg"
          >
            注册
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
