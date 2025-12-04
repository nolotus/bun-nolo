import React, { useState } from "react";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";

import {
  LuUser,
  LuKeyRound,
  LuMail,
  LuClipboard,
  LuClipboardCheck,
} from "react-icons/lu";

import LanguageSwitcher from "render/web/ui/LanguageSwitcher";

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

  /* 头像区域 */
  .avatar-section {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .avatar-preview {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--backgroundSecondary);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--textSecondary);
  }

  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-upload {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .avatar-upload-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
  }

  .avatar-upload-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .avatar-input {
    display: none;
  }

  .avatar-upload-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--space-4);
    height: 32px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--backgroundSecondary);
    color: var(--textSecondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  }

  .avatar-upload-button:hover {
    background: var(--backgroundHover);
    border-color: var(--borderHover);
    color: var(--text);
  }

  .avatar-upload-hint {
    font-size: 0.8rem;
    color: var(--textTertiary);
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
    border-radius: var(--space-2);
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
    border-radius: var(--space-1);
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

  @media (max-width: 600px) {
    .avatar-section {
      flex-direction: row;
      align-items: center;
    }
  }
`;

// 单条资料项
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

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // 本地头像预览（优先用已有 avatarUrl，如果有的话）
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    () => (user as any)?.avatarUrl || null
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return url;
    });

    // TODO: 在这里调用后端接口上传头像文件
    // uploadAvatar(file).then(...)
  };

  return (
    <>
      <style href="UserProfile-styles" precedence="low">
        {userProfileStyles}
      </style>
      <div className="user-profile-page">
        <h1 className="page-title">{t("userProfile.title", "个人资料")}</h1>

        {/* 头像区域 */}
        <div className="avatar-section">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={t("userProfile.avatarAlt", "用户头像")}
              />
            ) : (
              <LuUser size={32} />
            )}
          </div>
          <div className="avatar-upload">
            <div className="avatar-upload-label">
              {t("userProfile.avatar", "头像")}
            </div>
            <div className="avatar-upload-actions">
              <label className="avatar-upload-button">
                <input
                  className="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                {t("userProfile.avatar.upload", "上传新头像")}
              </label>
              <span className="avatar-upload-hint">
                {t(
                  "userProfile.avatar.hint",
                  "支持 PNG / JPG，建议大小不超过 2MB"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 基本资料 */}
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
