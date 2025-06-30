import React, { useState } from "react";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/settings/settingSlice";

//web
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";
import {
  PersonIcon,
  KeyIcon,
  MailIcon,
  CopyIcon,
  CheckIcon,
  SignOutIcon,
} from "@primer/octicons-react";

// 可复用的个人信息条目组件
const ProfileItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
  isCopyable?: boolean;
}> = ({ icon, label, value, isCopyable = false }) => {
  const [copied, setCopied] = useState(false);
  const theme = useAppSelector(selectTheme);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2秒后恢复图标
  };

  return (
    <div
      className="profile-item"
      style={{ background: theme.backgroundSecondary }}
    >
      <div className="profile-item-main">
        <span className="profile-item-icon">{icon}</span>
        <span className="profile-item-label">{label}</span>
        <span className="profile-item-value">{value || "N/A"}</span>
      </div>
      {isCopyable && value && (
        <button
          onClick={handleCopy}
          className={`copy-button ${copied ? "copied" : ""}`}
          aria-label={`Copy ${label}`}
        >
          {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
      )}
    </div>
  );
};

// 主页面组件
const UserProfile = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <style href="UserProfile-styles" precedence="low">
        {`
          .user-profile-page {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[8]};
            max-width: 800px;
          }
          .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${theme.text};
            margin: 0;
            padding-bottom: ${theme.space[4]};
            border-bottom: 1px solid ${theme.border};
          }
          .profile-section {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[4]};
          }
          .profile-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: ${theme.space[3]} ${theme.space[4]};
            border-radius: ${theme.borderRadius};
            border: 1px solid ${theme.border};
            transition: border-color 0.2s;
          }
          .profile-item:hover {
            border-color: ${theme.borderHover};
          }
          .profile-item-main {
            display: flex;
            align-items: center;
            gap: ${theme.space[4]};
            flex-grow: 1;
            overflow: hidden;
          }
          .profile-item-icon {
            color: ${theme.textSecondary};
          }
          .profile-item-label {
            color: ${theme.textSecondary};
            font-weight: 500;
          }
          .profile-item-value {
            color: ${theme.text};
            font-family: 'SF Mono', 'Monaco', monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .copy-button {
            background: none;
            border: none;
            cursor: pointer;
            padding: ${theme.space[2]};
            border-radius: ${theme.borderRadius - 2}px;
            color: ${theme.textSecondary};
            display: flex;
            align-items: center;
          }
          .copy-button:hover {
            background-color: ${theme.backgroundTertiary};
            color: ${theme.text};
          }
          .copy-button.copied {
            color: ${theme.success};
          }
          .language-section-header, .danger-zone-header {
             margin-bottom: ${theme.space[2]};
          }
           .section-title {
             font-size: 1.1rem;
             font-weight: 500;
          }
          .logout-button {
            align-self: flex-start;
            padding: ${theme.space[2]} ${theme.space[4]};
            background-color: ${theme.dangerBackground};
            color: ${theme.danger};
            border: 1px solid ${theme.dangerBorder};
            border-radius: ${theme.borderRadius};
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            gap: ${theme.space[2]};
          }
          .logout-button:hover {
            background-color: ${theme.dangerBackgroundHover};
          }
        `}
      </style>
      <div className="user-profile-page">
        <h1 className="page-title">{t("userProfile.title", "个人资料")}</h1>

        <div className="profile-section">
          <ProfileItem
            icon={<PersonIcon size={16} />}
            label={t("username", "用户名")}
            value={user?.username}
          />
          <ProfileItem
            icon={<KeyIcon size={16} />}
            label={t("userId", "用户ID")}
            value={user?.userId}
            isCopyable
          />
          <ProfileItem
            icon={<MailIcon size={16} />}
            label={t("email", "邮箱")}
            value={user?.email}
            isCopyable
          />
        </div>

        <div>
          <h2 className="section-title language-section-header">
            {t("userProfile.language", "语言")}
          </h2>
          <LanguageSwitcher />
        </div>

        <div>
          <h2
            className="section-title danger-zone-header"
            style={{ color: theme.danger }}
          >
            {t("userProfile.dangerZone", "危险区域")}
          </h2>
          <button className="logout-button" onClick={logout}>
            <SignOutIcon size={16} />
            {t("userProfile.logout", "退出登录")}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
