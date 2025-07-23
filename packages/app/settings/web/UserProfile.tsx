import React, { useState } from "react";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";

// Icons from lucide-react, as per tech stack
import {
  LuUser,
  LuKeyRound,
  LuMail,
  LuClipboard,
  LuClipboardCheck,
} from "react-icons/lu";

// Reusable components
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";

// CSS is now a static string using CSS variables
const userProfileStyles = `
  .user-profile-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    max-width: 800px;
  }
  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border);
  }
  .profile-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .profile-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--backgroundSecondary);
    border-radius: var(--space-2); /* 8px */
    border: 1px solid var(--border);
    transition: border-color 0.2s;
  }
  .profile-item:hover {
    border-color: var(--borderHover);
  }
  .profile-item-main {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-grow: 1;
    overflow: hidden;
  }
  .profile-item-icon {
    color: var(--textSecondary);
  }
  .profile-item-label {
    color: var(--textSecondary);
    font-weight: 500;
  }
  .profile-item-value {
    color: var(--text);
    font-family: 'SF Mono', 'Monaco', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .copy-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--space-1); /* 4px */
    color: var(--textSecondary);
    display: flex;
    align-items: center;
    transition: background-color 0.2s, color 0.2s;
  }
  .copy-button:hover {
    background-color: var(--backgroundTertiary);
    color: var(--text);
  }
  .copy-button.copied {
    color: var(--success);
  }
  .section-title {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: var(--space-2);
  }
`;

// Reusable profile item component
const ProfileItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
  isCopyable?: boolean;
}> = ({ icon, label, value, isCopyable = false }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="profile-item">
      <div className="profile-item-main">
        <span className="profile-item-icon">{icon}</span>
        <span className="profile-item-label">{label}</span>
        <span className="profile-item-value">{value || "N/A"}</span>
      </div>
      {isCopyable && value && (
        <button
          onClick={handleCopy}
          className={`copy-button ${isCopied ? "copied" : ""}`}
          aria-label={`Copy ${label}`}
        >
          {isCopied ? (
            <LuClipboardCheck size={16} />
          ) : (
            <LuClipboard size={16} />
          )}
        </button>
      )}
    </div>
  );
};

// Main page component
const UserProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <style href="UserProfile-styles" precedence="low">
        {userProfileStyles}
      </style>
      <div className="user-profile-page">
        <h1 className="page-title">{t("userProfile.title", "个人资料")}</h1>

        <div className="profile-section">
          <ProfileItem
            icon={<LuUser size={16} />}
            label={t("username", "用户名")}
            value={user?.username}
          />
          <ProfileItem
            icon={<LuKeyRound size={16} />}
            label={t("userId", "用户ID")}
            value={user?.userId}
            isCopyable
          />
          <ProfileItem
            icon={<LuMail size={16} />}
            label={t("email", "邮箱")}
            value={user?.email}
            isCopyable
          />
        </div>

        <div>
          <h2 className="section-title">{t("userProfile.language", "语言")}</h2>
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
};

export default UserProfile;
