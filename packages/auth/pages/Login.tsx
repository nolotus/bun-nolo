import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, LockIcon } from "@primer/octicons-react";
import { FormField } from "render/ui/Form/FormField";
import { LifeRoutePaths } from "life/routes";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "render/ui";
import Sizes from "open-props/src/sizes";
import { useAppDispatch } from "app/hooks";
import { useSelector } from "react-redux";
import { hashPassword } from "core/password";
import { storeTokens } from "auth/client/token";

import { signInFields } from "../schema";
import { signIn } from "../authSlice";
import { userFormSchema } from "../schema";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { t } = useTranslation();
  const [error, setError] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit = async (data) => {
    const locale = navigator.language;
    const { password } = data;
    const encryptionKey = await hashPassword(password);
    const action = await dispatch(signIn({ ...data, locale, encryptionKey }));

    if (action.payload.token) {
      storeTokens(action.payload.token);
      navigate(`/${LifeRoutePaths.WELCOME}`);
    }
    if (action.payload.status) {
      switch (action.payload.status) {
        case 404:
          setError(t("errors.userNotFound"));
          break;
        case 403:
          setError(t("errors.invalidCredentials"));
          break;
        case 400:
          setError(t("errors.validationError"));
          break;
        case 500:
        default:
          setError(t("errors.serverError"));
          break;
      }
    }
  };
  return (
    <div>
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
          <h2 className="mb-6">{t("login")}</h2>
          {signInFields.map((field) => (
            <div key={field.id} className="mb-6">
              <label htmlFor={field.id} className="mb-2 block">
                {t(field.label)}
              </label>
              <FormField
                {...field}
                register={register}
                errors={errors}
                icon={field.id === "username" ? <PersonIcon /> : <LockIcon />}
              />
            </div>
          ))}
          {error && <p className="mb-2 mt-2 text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            width="w-full" // 通过 props 传递宽度类
            loading={isLoading}
          >
            {t("submit")}
          </Button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: Sizes["--size-fluid-1"],
            }}
          >
            <NavLink to="/signup">注册</NavLink>
            <NavLink to="/">忘记密码</NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
