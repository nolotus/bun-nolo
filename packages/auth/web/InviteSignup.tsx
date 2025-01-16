import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import { inviteSignUp } from "auth/authSlice";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import Button from "web/ui/Button";
import z from "zod";

const InviteSignup: React.FC = () => {
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const userFormSchema = z.object({
    email: z
      .string()
      .nonempty({ message: t("emailRequired") || "" })
      .email({ message: t("invalidEmail") || "" }),
    purpose: z
      .string()
      .nonempty({ message: t("purposeRequired") || "" })
      .min(10, { message: t("purposeTooShort") || "" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit = async (data) => {
    try {
      const action = await dispatch(inviteSignUp(data));

      if (action.payload.success) {
        // 处理成功逻辑，比如显示成功消息
        return;
      }

      switch (action.payload.status) {
        case 422:
          setError(t("invalidEmail"));
          break;
        case 409:
          setError(t("emailExists"));
          break;
        default:
          setError(t("operationFailed"));
      }
    } catch (err) {
      setError(t("networkError"));
    }
  };

  return (
    <div className="invite-signup-container">
      <style>{`
        .invite-signup-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100dvh - 60px);
          padding: 24px;
        }
        
        .invite-signup-form {
          width: 100%;
          max-width: 380px;
        }
        
        .invite-signup-title {
          font-size: 32px;
          font-weight: 600;
          color: ${theme.text};
          margin-bottom: 24px;
          text-align: center;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .beta-tag {
          display: inline-block;
          background-color: ${theme.primary};
          color: white;
          font-size: 14px;
          padding: 2px 10px;
          border-radius: 12px;
          font-weight: 500;
        }

        .description {
          text-align: center;
          color: ${theme.textSecondary};
          font-size: 15px;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        
        .field-group {
          margin-bottom: 28px;
        }
        
        .error-message {
          font-size: 14px;
          color: ${theme.error};
          margin-top: 8px;
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

        @media (min-width: 768px) {
          .invite-signup-form {
            max-width: 420px;
          }

          .invite-signup-title {
            font-size: 36px;
          }

          .description {
            font-size: 16px;
            margin-bottom: 48px;
          }
        }

        @media (min-width: 1200px) {
          .invite-signup-form {
            max-width: 460px;
          }

          .invite-signup-title {
            font-size: 40px;
          }

          .description {
            margin-bottom: 56px;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit(onSubmit)} className="invite-signup-form">
        <h1 className="invite-signup-title">
          {t("betaAccess")}
          <span className="beta-tag">Beta</span>
        </h1>

        <p className="description">{t("betaDescription")}</p>

        <div className="field-group">
          <Input
            placeholder={t("enterEmail")}
            {...register("email")}
            error={!!errors.email}
            icon={<MailIcon size={20} />}
            type="email"
            autoComplete="email"
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        <div className="field-group">
          <TextArea
            placeholder={t("purposeHolder")}
            {...register("purpose")}
            error={!!errors.purpose}
            rows={3}
          />
          {errors.purpose && (
            <p className="error-message">{errors.purpose.message}</p>
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
            {isLoading ? t("loading") : t("applyForAccess")}
          </Button>

          <div className="login-section">
            <span className="link-text">{t("haveAccount")}</span>
            <NavLink to="/login" className="login-link">
              {t("loginNow")}
            </NavLink>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InviteSignup;
