import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { signIn } from "../authSlice";
import z from "zod";

import { LockIcon, PersonIcon } from "@primer/octicons-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Input } from "web/form/Input";
import Button from "render/web/ui/Button";
import { PasswordInput } from "web/form/Input";

import { RoutePaths } from "./routes";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const userFormSchema = z.object({
    username: z.string().nonempty({ message: t("usernameRequired") || "" }),
    password: z.string().nonempty({ message: t("passwordRequired") || "" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(userFormSchema) });

  const onSubmit = async (data: any) => {
    try {
      const locale = navigator.language;
      const result = await dispatch(signIn({ ...data, locale })).unwrap();
      if (result.token) {
        navigate("/");
      }
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
            <p className="error-message">{errors.username.message}</p>
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
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        <div className="forgot-password-wrapper">
          <NavLink to="/forgot-password" className="forgot-password">
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
            <NavLink to={RoutePaths.SIGNUP} className="signup-link">
              {t("signUpNow")}
            </NavLink>
          </div>
        </div>
      </form>

      <style>
        {`
          .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100dvh - 60px);
            padding: 24px;
          }

          .login-form {
            width: 100%;
            max-width: 380px;
          }

          .login-title {
            font-size: 32px;
            font-weight: 600;
            color: ${theme.text};
            margin-bottom: 48px;
            text-align: center;
            letter-spacing: -0.5px;
          }

          .field-group {
            margin-bottom: 28px;
          }

          .error-message {
            font-size: 14px;
            color: ${theme.error};
            margin-top: 8px;
          }

          .forgot-password-wrapper {
            text-align: right;
            margin-bottom: 32px;
          }

          .forgot-password {
            color: ${theme.primary};
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s;
          }

          .forgot-password:hover {
            color: ${theme.primaryLight};
          }

          .form-footer {
            display: flex;
            flex-direction: column;
            gap: 32px;
            align-items: center;
          }

          .signup-section {
            text-align: center;
          }

          .link-text {
            color: ${theme.textSecondary};
            font-size: 15px;
          }

          .signup-link {
            color: ${theme.primary};
            text-decoration: none;
            font-size: 15px;
            margin-left: 6px;
            font-weight: 500;
            transition: color 0.2s;
          }

          .signup-link:hover {
            color: ${theme.primaryLight};
          }

          @media (min-width: 768px) {
            .login-form {
              max-width: 420px;
            }
  
            .login-title {
              font-size: 36px;
              margin-bottom: 56px;
            }
  
            .field-group {
              margin-bottom: 32px;
            }
          }
  
          @media (min-width: 1200px) {
            .login-form {
              max-width: 460px;
            }
  
            .login-title {
              font-size: 40px;
              margin-bottom: 64px;
            }
  
            .field-group {
              margin-bottom: 36px;
            }
  
            .form-footer {
              gap: 40px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;
