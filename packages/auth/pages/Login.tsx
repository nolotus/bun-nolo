import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, LockIcon } from "@primer/octicons-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import Sizes from "open-props/src/sizes";

import { hashPassword } from "core/password";
import { storeTokens } from "auth/client/token";

import { FormField } from "render/ui/Form/FormField";
import { Button } from "render/ui";
import { useAppDispatch } from "app/hooks";

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
      window.location.href = "/"; // 使用普通 JavaScript 跳转
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: "100%", maxWidth: "32rem" }}
      >
        <h2 style={{ marginBottom: "1.5rem" }}>{t("login")}</h2>
        {signInFields.map((field) => (
          <div key={field.id} style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor={field.id}
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
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
        {error && (
          <p
            style={{
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              color: "red",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          width="100%" // 通过 props 传递宽度样式
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
  );
};

export default Login;
