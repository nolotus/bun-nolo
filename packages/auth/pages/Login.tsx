import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, LockIcon } from "@primer/octicons-react";
import { FormField } from "components/Form/FormField";
import { LifeRoutePaths } from "life/routes";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "ui";

import { userFormSchema } from "../schema";
import { useAppDispatch } from "app/hooks";
import { signIn } from "../authSlice";
import { loginFields } from "../schema";
import { useSelector } from "react-redux";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });
  const onSubmit = async (input) => {
    const locale = navigator.language;
    try {
      const resultAction = await dispatch(signIn({ ...input, locale }));
      if (resultAction.payload.token) {
        navigate(`/${LifeRoutePaths.WELCOME}`);
      }

      return;
    } catch (noloError) {
      console.error(noloError);

      let message;
      switch (noloError.message) {
        case "404":
          message = t("errors.userNotFound");
          break;
        case "403":
          message = t("errors.invalidCredentials");
          break;
        case "400":
          message = t("errors.validationError");
          break;
        case "500":
        default:
          message = t("errors.serverError");
          break;
      }

      setError(message);
    }
  };
  return (
    <div>
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-lg rounded bg-white p-10 shadow"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            {t("login")}
          </h2>
          {loginFields.map((field) => (
            <div key={field.id} className="mb-6">
              <label
                htmlFor={field.id}
                className="mb-2 block text-sm font-medium text-gray-700"
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
            variant="primary"
            size="medium"
            width="w-full" // 通过 props 传递宽度类
            loading={isLoading}
          >
            {t("submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
