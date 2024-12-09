import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, LockIcon } from "@primer/octicons-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "app/hooks";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { hashPassword } from "core/password";
import { storeTokens } from "auth/client/token";
import { FormField } from "render/ui/Form/FormField";
import { formStyles } from "render/styles/form";

import { signInFields } from "../schema";
import { signIn } from "../authSlice";
import { userFormSchema } from "../schema";

const Login: React.FC = () => {
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
      window.location.href = "/";
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
    <div style={formStyles.container}>
      <form onSubmit={handleSubmit(onSubmit)} style={formStyles.form}>
        <h2 style={formStyles.title}>{t("login")}</h2>

        {signInFields.map((field) => (
          <div key={field.id} style={formStyles.fieldWrapper}>
            <label htmlFor={field.id} style={formStyles.label}>
              {t(field.label)}
            </label>
            <FormField
              {...field}
              register={register}
              errors={errors}
              icon={
                field.id === "username" ? (
                  <PersonIcon size={20} />
                ) : (
                  <LockIcon size={20} />
                )
              }
            />
          </div>
        ))}

        {error && <p style={formStyles.error}>{error}</p>}

        <div style={formStyles.footer}>
          <button type="submit" style={formStyles.button}>
            {t("login")}
          </button>

          <div>
            <span style={formStyles.linkText}>没有账号？</span>
            <NavLink to="/signup" style={formStyles.link}>
              立即注册
            </NavLink>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
