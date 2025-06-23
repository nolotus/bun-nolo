import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "app/theme";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, NavLink } from "react-router-dom";
import z from "zod";
import { Input } from "web/form/Input";
import PasswordInput from "web/form/PasswordInput";
import Button from "render/web/ui/Button";
import {
  LockIcon,
  PersonIcon,
  MailIcon,
  PeopleIcon,
  GiftIcon,
} from "@primer/octicons-react";
import { createUserKey } from "database/keys";
import { read } from "database/dbSlice";
import useRegister from "./useRegister";

const InviteSignup: React.FC = () => {
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const { handleRegister, error } = useRegister();
  const location = useLocation();
  const dispatch = useDispatch();

  const queryParams = new URLSearchParams(location.search);
  const inviterId = queryParams.get("inviterId") || "";
  const initialInviterName = queryParams.get("inviterName") || ""; // Fallback name

  const [inviterProfile, setInviterProfile] = useState({
    nickname: initialInviterName,
    avatar: "",
  });

  useEffect(() => {
    const fetchInviterProfile = async () => {
      if (!inviterId) return;

      try {
        const profileKey = createUserKey.profile(inviterId);
        // We assume `read` action handles not found cases gracefully (e.g., returns null)
        const userProfile = await dispatch(read(profileKey)).unwrap();
        if (userProfile) {
          setInviterProfile({
            nickname: userProfile.nickname || initialInviterName,
            avatar: userProfile.avatar || "",
          });
        }
      } catch (e) {
        // If fetching fails, we just use the initial name from the URL
        console.error("Failed to fetch inviter profile:", e);
        setInviterProfile({ nickname: initialInviterName, avatar: "" });
      }
    };

    fetchInviterProfile();
  }, [inviterId, initialInviterName, dispatch]);

  // Use Zod for schema validation with translation keys
  const userFormSchema = z.object({
    username: z.string().nonempty({ message: t("usernameRequired") || "" }),
    password: z.string().nonempty({ message: t("passwordRequired") || "" }),
    email: z
      .string()
      .email({ message: t("invalidEmail") || "" })
      .optional()
      .or(z.literal("")),
    inviterId: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      inviterId: inviterId,
    },
  });

  const onSubmit = (data) => {
    handleRegister({
      ...data,
      inviterCode: queryParams.get("code") || undefined, // Keep inviterCode if it exists
    });
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
        {inviterProfile.nickname && (
          <div className="invite-header">
            {inviterProfile.avatar && (
              <img
                src={inviterProfile.avatar}
                alt={t("inviterAvatarAlt", { name: inviterProfile.nickname })}
                className="inviter-avatar"
              />
            )}
            <div className="invite-text">
              {t("inviteHeader", { name: inviterProfile.nickname })}
            </div>
            <p className="invite-desc">{t("invitePartnerDescription")}</p>
          </div>
        )}

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
            placeholder={t("emailOptionalPlaceholder")}
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
          <Input
            placeholder={t("inviterIdOptionalPlaceholder")}
            {...register("inviterId")}
            error={!!errors.inviterId}
            icon={<PeopleIcon size={20} />}
            autoComplete="off"
          />
          {errors.inviterId && (
            <p className="error-message">{errors.inviterId.message}</p>
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

          <div className="reward-hint">
            <GiftIcon size={16} />
            <span>{t("inviteGeneralHint")}</span>
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
          background: linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundSecondary} 100%);
        }

        .signup-form {
          width: 100%;
          max-width: 380px;
          background: ${theme.background};
          border-radius: 16px;
          box-shadow: 
            0 20px 40px ${theme.shadow1},
            0 4px 16px ${theme.shadow2};
          border: 1px solid ${theme.border};
          padding: 32px 24px;
        }

        .invite-header {
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primaryLight}10 100%);
          border: 1px solid ${theme.primary}20;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .inviter-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin-bottom: 12px;
          border: 2px solid ${theme.primary}40;
          object-fit: cover;
        }

        .invite-text {
          font-size: 16px;
          color: ${theme.text};
          font-weight: 600;
          margin-bottom: 8px;
        }

        .invite-desc {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.4;
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

        .reward-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${theme.primary};
          font-size: 14px;
          font-weight: 500;
          background: ${theme.primary}08;
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
        }

        @media (min-width: 768px) {
          .signup-form {
            max-width: 420px;
            padding: 40px 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default InviteSignup;
