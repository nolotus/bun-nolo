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
  CheckIcon,
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

  const [inviterProfile, setInviterProfile] = useState({
    nickname: "",
    username: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchInviterProfile = async () => {
      if (!inviterId) return;

      try {
        const profileKey = createUserKey.profile(inviterId);
        const userProfile = await dispatch(read(profileKey)).unwrap();
        if (userProfile) {
          setInviterProfile({
            nickname: userProfile.nickname || "",
            username: userProfile.username || t("unknown"),
            avatar: userProfile.avatar || "",
          });
        }
      } catch (e) {
        console.error("Failed to fetch inviter profile:", e);
      }
    };

    fetchInviterProfile();
  }, [inviterId, dispatch, t]);

  const userFormSchema = z.object({
    username: z.string().nonempty({ message: t("usernameRequired") || "" }),
    password: z.string().nonempty({ message: t("passwordRequired") || "" }),
    email: z
      .string()
      .email({ message: t("invalidEmail") || "" })
      .optional()
      .or(z.literal("")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit = (data) => {
    handleRegister({
      ...data,
      inviterId: inviterId,
      inviterCode: queryParams.get("code") || undefined,
    });
  };

  const displayName = inviterProfile.nickname || inviterProfile.username;

  return (
    <div className="invite-signup">
      <div className="invite-container">
        {displayName && (
          <div className="invite-header">
            {inviterProfile.avatar && (
              <img
                src={inviterProfile.avatar}
                alt={t("inviterAvatarAlt", { name: displayName })}
                className="inviter-avatar"
              />
            )}
            <div className="invite-content">
              <h2 className="invite-title">
                {t("inviteHeader", { name: displayName })}
              </h2>
              <p className="invite-desc">{t("invitePartnerDescription")}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
          <div className="form-header">
            <h1 className="form-title">{t("signup")}</h1>
          </div>

          <div className="form-fields">
            <div className="field-group">
              <Input
                placeholder={t("enterUsername")}
                {...register("username")}
                error={!!errors.username}
                icon={<PersonIcon size={18} />}
                autoComplete="username"
              />
              {errors.username && (
                <span className="field-error">{errors.username.message}</span>
              )}
            </div>

            <div className="field-group">
              <PasswordInput
                placeholder={t("enterPassword")}
                {...register("password")}
                error={!!errors.password}
                icon={<LockIcon size={18} />}
                autoComplete="new-password"
              />
              {errors.password && (
                <span className="field-error">{errors.password.message}</span>
              )}
            </div>

            <div className="field-group">
              <Input
                placeholder={t("emailOptionalPlaceholder")}
                {...register("email")}
                error={!!errors.email}
                icon={<MailIcon size={18} />}
                type="email"
                autoComplete="email"
              />
              {errors.email && (
                <span className="field-error">{errors.email.message}</span>
              )}
            </div>

            {displayName && (
              <div className="field-group">
                <div className="inviter-field">
                  <div className="inviter-field-icon">
                    <CheckIcon size={18} />
                  </div>
                  <div className="inviter-field-content">
                    <div className="inviter-field-label">{t("invitedBy")}</div>
                    <div className="inviter-field-value">{displayName}</div>
                  </div>
                  <div className="inviter-field-badge">
                    {t("acceptInvitation")}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <Button
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              className="submit-button"
              type="submit"
            >
              {isLoading ? t("loading") : t("signup")}
            </Button>

            <div className="reward-hint">
              <GiftIcon size={16} />
              <span>{t("inviteGeneralHint")}</span>
            </div>

            <div className="auth-switch">
              <span className="switch-text">{t("haveAccount")}</span>
              <NavLink to="/login" className="switch-link">
                {t("loginNow")}
              </NavLink>
            </div>
          </div>
        </form>
      </div>

      <style href="invite-signup-styles" precedence="medium">
        {`
          .invite-signup {
            min-height: 100dvh;
            background: ${theme.background};
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: ${theme.space[4]};
          }

          .invite-container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: ${theme.space[8]};
          }

          .invite-header {
            display: flex;
            align-items: center;
            gap: ${theme.space[4]};
            padding: ${theme.space[6]};
            background: ${theme.backgroundSecondary};
            border-radius: 12px;
          }

          .inviter-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
          }

          .invite-content {
            flex: 1;
            min-width: 0;
          }

          .invite-title {
            font-size: 18px;
            font-weight: 600;
            color: ${theme.text};
            margin: 0 0 ${theme.space[1]} 0;
            line-height: 1.3;
          }

          .invite-desc {
            font-size: 14px;
            color: ${theme.textSecondary};
            margin: 0;
            line-height: 1.4;
          }

          .signup-form {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[8]};
          }

          .form-header {
            text-align: center;
          }

          .form-title {
            font-size: 28px;
            font-weight: 600;
            color: ${theme.text};
            margin: 0;
            letter-spacing: -0.3px;
          }

          .form-fields {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[5]};
          }

          .field-group {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[2]};
          }

          .field-error {
            font-size: 13px;
            color: ${theme.error};
            padding-left: ${theme.space[1]};
          }

          .inviter-field {
            display: flex;
            align-items: center;
            padding: ${theme.space[4]};
            background: ${theme.primary}08;
            border-radius: 10px;
            gap: ${theme.space[3]};
          }

          .inviter-field-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: ${theme.primary}15;
            border-radius: 8px;
            color: ${theme.primary};
            flex-shrink: 0;
          }

          .inviter-field-content {
            flex: 1;
            min-width: 0;
          }

          .inviter-field-label {
            font-size: 12px;
            color: ${theme.textTertiary};
            font-weight: 500;
            margin-bottom: ${theme.space[1]};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .inviter-field-value {
            font-size: 15px;
            color: ${theme.text};
            font-weight: 600;
            line-height: 1.2;
          }

          .inviter-field-badge {
            padding: ${theme.space[1]} ${theme.space[2]};
            background: ${theme.primary};
            color: white;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            flex-shrink: 0;
          }

          .form-error {
            padding: ${theme.space[3]} ${theme.space[4]};
            background: ${theme.error}08;
            color: ${theme.error};
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
          }

          .form-actions {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[6]};
            align-items: center;
          }

          .submit-button {
            width: 100%;
          }

          .reward-hint {
            display: flex;
            align-items: center;
            gap: ${theme.space[2]};
            color: ${theme.primary};
            font-size: 14px;
            font-weight: 500;
            background: ${theme.primary}08;
            padding: ${theme.space[3]} ${theme.space[4]};
            border-radius: 8px;
            text-align: center;
          }

          .auth-switch {
            text-align: center;
          }

          .switch-text {
            color: ${theme.textSecondary};
            font-size: 15px;
          }

          .switch-link {
            color: ${theme.primary};
            text-decoration: none;
            font-size: 15px;
            margin-left: ${theme.space[1]};
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .switch-link:hover {
            color: ${theme.primaryLight};
          }

          @media (min-width: 768px) {
            .invite-signup {
              padding: ${theme.space[6]};
            }

            .invite-container {
              max-width: 420px;
            }

            .invite-header {
              padding: ${theme.space[8]};
            }

            .form-title {
              font-size: 32px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default InviteSignup;
