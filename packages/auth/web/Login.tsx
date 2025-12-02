import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, PersonIcon } from "@primer/octicons-react";
import { AppRoutePaths } from "app/constants/routePaths";
import { useAppDispatch } from "app/store";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "render/web/ui/Button";
import { Input, PasswordInput } from "render/web/form/Input";
import { signIn } from "../authSlice";
import z from "zod";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isLoading } = useSelector((state: any) => state.auth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        username: z.string().nonempty(t("usernameRequired") || ""),
        password: z.string().nonempty(t("passwordRequired") || ""),
      })
    ),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await dispatch(
        signIn({ ...data, locale: navigator.language })
      ).unwrap();
      if (res.token) navigate("/");
    } catch (err) {
      setError(typeof err === "string" ? err : t("networkError"));
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <h1 className="login-title">{t("login")}</h1>
        <div className="field-group">
          <Input
            placeholder={t("enterUsername")}
            {...register("username")}
            error={!!errors.username}
            icon={<PersonIcon size={20} />}
            autoComplete="username"
          />
          {errors.username && (
            <p className="error-message">{errors.username.message as string}</p>
          )}
        </div>
        <div className="field-group">
          <PasswordInput
            placeholder={t("enterPassword")}
            {...register("password")}
            error={!!errors.password}
            icon={<LockIcon size={20} />}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="error-message">{errors.password.message as string}</p>
          )}
        </div>
        <div className="forgot-wrapper">
          <NavLink to="/forgot-password" className="forgot-link">
            {t("forgotPassword")}
          </NavLink>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="form-footer">
          <Button
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            style={{ width: "100%" }}
            type="submit"
          >
            {isLoading ? t("loading") : t("login")}
          </Button>
          <div className="signup-section">
            <span className="link-text">{t("noAccount")}</span>
            <NavLink to={AppRoutePaths.SIGNUP} className="signup-link">
              {t("signUpNow")}
            </NavLink>
          </div>
        </div>
      </form>
      <style href="login-page" precedence="medium">{`
        .login-container { display: flex; justify-content: center; align-items: center; min-height: calc(100dvh - 60px); padding: 24px; }
        .login-form { width: 100%; max-width: 380px; }
        .login-title { font-size: 32px; font-weight: 600; color: var(--text); margin-bottom: 48px; text-align: center; letter-spacing: -0.5px; }
        .field-group { margin-bottom: 28px; }
        .error-message { font-size: 14px; color: var(--error); margin-top: 8px; }
        .forgot-wrapper { text-align: right; margin-bottom: 32px; }
        .forgot-link, .signup-link { color: var(--primary); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .forgot-link:hover, .signup-link:hover { color: var(--primaryLight); }
        .form-footer { display: flex; flex-direction: column; gap: 32px; align-items: center; }
        .signup-section { text-align: center; }
        .link-text { color: var(--textSecondary); font-size: 15px; }
        .signup-link { font-size: 15px; margin-left: 6px; }
        @media (min-width: 768px) {
          .login-form { max-width: 420px; }
          .login-title { font-size: 36px; margin-bottom: 56px; }
          .field-group { margin-bottom: 32px; }
        }
        @media (min-width: 1200px) {
          .login-form { max-width: 460px; }
          .login-title { font-size: 40px; margin-bottom: 64px; }
          .field-group { margin-bottom: 36px; }
          .form-footer { gap: 40px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
