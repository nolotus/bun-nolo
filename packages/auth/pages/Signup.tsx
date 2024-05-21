import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, LockIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { signUp } from "auth/authSlice";
import { storeTokens } from "auth/client/token";
import { FormField } from "components/Form/FormField";
import { LifeRoutePaths } from "life/routes";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "ui";

import { signUpfields, signUpSchema } from "../schema";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (user) => {
    try {
      // setLoading(true);
      // await handleSignup(user);

      // Get the user's language setting
      const locale = navigator.language;
      dispatch(signUp({ ...user, locale })).then((action) => {
        const result = action.payload;
        const { token } = result;
        if (token) {
          storeTokens(token);
        }
        navigate(`/${LifeRoutePaths.WELCOME}`);
      });
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });
  return (
    <div>
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-lg rounded-lg bg-white p-10 shadow"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            {t("signup")}
          </h2>
          {signUpfields.map((field) => (
            <div key={field.id} className="mb-4 flex flex-col">
              <label
                htmlFor={field.id}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {t(field.label)}
              </label>
              <FormField
                {...field}
                register={register}
                errors={errors}
                icon={
                  field.id === "username" ? (
                    <PersonIcon className="text-gray-400" size={24} />
                  ) : (
                    <LockIcon className="text-gray-400" size={24} />
                  )
                }
              />
            </div>
          ))}

          {error && <p className="mb-2 mt-2 text-sm text-red-500">{error}</p>}

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
