import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "app/theme";
import type React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import z from "zod";
import { NavLink } from "react-router-dom";

import { Input, PasswordInput } from "render/web/form/Input";
import Button from "render/web/ui/Button";
import { LockIcon, PersonIcon, MailIcon } from "@primer/octicons-react";
import useRegister from "./useRegister";

const Signup: React.FC = () => {
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const { handleRegister, error } = useRegister();

  const userFormSchema = z.object({
    username: z.string().nonempty({ message: t("usernameRequired") || "" }),
    password: z.string().nonempty({ message: t("passwordRequired") || "" }),
    email: z
      .string()
      .email({ message: t("invalidEmail") || "" })
      .optional()
      .or(z.literal("")), // 允许空字符串
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit = (data) => {
    handleRegister(data);
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
        <h1 className="signup-title">{t("signup")}</h1>

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
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>
        <div className="field-group">
          <Input
            placeholder={t("enterEmail")}
            {...register("email")}
            error={!!errors.email}
            icon={<MailIcon size={20} />} // 需要从 @primer/octicons-react 引入 MailIcon
            type="email"
            autoComplete="email"
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
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
            {isLoading ? t("loading") : t("signup")}
          </Button>

          <div className="login-section">
            <span className="link-text">{t("haveAccount")}</span>
            <NavLink to="/login" className="login-link">
              {t("loginNow")}
            </NavLink>
          </div>

          <div className="hint-section">
            <p className="hint-text">{t("hintofKey")}</p>
          </div>
        </div>
      </form>
      <style>{`
  .signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100dvh - 60px);
    padding: 24px;
  }

  .signup-form {
    width: 100%;
    max-width: 380px;
  }

  .signup-title {
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

  .remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .login-section {
    text-align: center;
  }

  .link-text {
    color: ${theme.textSecondary};
    font-size: 15px;
  }

  .login-link {
    color: ${theme.primary};
    text-decoration: none;
    font-size: 15px;
    margin-left: 6px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .login-link:hover {
    color: ${theme.primaryLight};
  }

  .hint-section {
    text-align: center;
    margin-top: 16px;
  }

  .hint-text {
    font-size: 14px;
    color: ${theme.textSecondary};
  }

  /* 响应式设计 */
  @media (min-width: 768px) {
    .signup-form {
      max-width: 420px;
    }

    .signup-title {
      font-size: 36px;
      margin-bottom: 56px;
    }

    .field-group {
      margin-bottom: 32px;
    }
  }

  @media (min-width: 1200px) {
    .signup-form {
      max-width: 460px;
    }

    .signup-title {
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
`}</style>
    </div>
  );
};

export default Signup;
