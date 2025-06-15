import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";

// 使用场景：用户个人资料页面

const UserProfile = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <h3 className="profile-title">{t("userProfile", "个人资料")}</h3>
          <LanguageSwitcher />
        </div>

        <div className="profile-content">
          <div className="profile-item">
            <span className="profile-label">{t("username", "用户名")}:</span>
            <span className="profile-value">{auth.user?.username}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">{t("userId", "用户ID")}:</span>
            <span className="profile-value">{auth.user?.userId}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">{t("email", "邮箱")}:</span>
            <span className="profile-value">{auth.user?.email}</span>
          </div>
        </div>
      </div>

      <style>{`
        .profile-container {
          max-width: 600px;
          margin: 0 auto;
          padding: ${theme.space[6]};
          background: ${theme.background};
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${theme.space[6]};
          padding-bottom: ${theme.space[4]};
          border-bottom: 1px solid ${theme.borderLight};
        }

        .profile-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: ${theme.text};
        }

        .profile-content {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[4]};
        }

        .profile-item {
          display: flex;
          align-items: center;
          padding: ${theme.space[4]};
          background: ${theme.backgroundSecondary};
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .profile-item:hover {
          background: ${theme.backgroundHover};
        }

        .profile-label {
          min-width: 80px;
          font-weight: 500;
          color: ${theme.textSecondary};
          margin-right: ${theme.space[4]};
        }

        .profile-value {
          color: ${theme.text};
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          background: ${theme.backgroundTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          border-radius: 4px;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .profile-container {
            padding: ${theme.space[4]};
          }

          .profile-header {
            flex-direction: column;
            gap: ${theme.space[4]};
            align-items: flex-start;
          }

          .profile-item {
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.space[2]};
          }

          .profile-label {
            min-width: auto;
            margin-right: 0;
          }

          .profile-value {
            width: 100%;
            word-break: break-all;
          }
        }
      `}</style>
    </>
  );
};

export default UserProfile;
