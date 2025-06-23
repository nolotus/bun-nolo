import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectUsers, signOut, changeUser, selectUserId } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { SettingRoutePaths } from "setting/config";
import toast from "react-hot-toast";

//web
import { Tooltip } from "render/web/ui/Tooltip";
import {
  GearIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import DropdownMenu from "web/ui/DropDownMenu";
import { NavLink, useNavigate } from "react-router-dom";

const MenuStyles = () => {
  const theme = useAppSelector(selectTheme);
  return (
    <style href="loginmenu-styles" precedence="medium">
      {`
        .loginmenu-wrapper {
          display: flex;
          align-items: center;
          padding: ${theme.space[2]} ${theme.space[4]};
          gap: ${theme.space[1]};
        }

        .loginmenu-icon-button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: ${theme.space[2]};
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.15s ease;
          color: ${theme.textSecondary};
          min-width: 36px;
          min-height: 36px;
        }

        .loginmenu-icon-button:hover {
          background-color: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .loginmenu-nav-link {
          text-decoration: none;
          color: ${theme.text};
        }

        .loginmenu-nav-link.active .loginmenu-user-trigger {
          background-color: ${theme.backgroundSelected};
          color: ${theme.text};
        }

        .loginmenu-nav-link:hover .loginmenu-user-trigger {
          background-color: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .loginmenu-user-trigger {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: 6px;
          transition: all 0.15s ease;
          color: ${theme.textSecondary};
          min-height: 36px;
        }

        .loginmenu-user-trigger-text {
          font-size: 14px;
          font-weight: 500;
          margin-left: ${theme.space[2]};
        }

        .loginmenu-dd-wrapper {
          padding: ${theme.space[2]};
          min-width: 200px;
          background: rgba(${theme.background
            .replace("#", "")
            .match(/.{2}/g)
            ?.map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.75);
          backdrop-filter: blur(16px) saturate(1.5);
          -webkit-backdrop-filter: blur(16px) saturate(1.5);
          border-radius: 10px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .loginmenu-dd-item {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          padding: ${theme.space[2]} ${theme.space[3]};
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
          color: ${theme.text};
          font-size: 14px;
          font-weight: 500;
          margin-bottom: ${theme.space[1]};
          min-height: 36px;
        }

        .loginmenu-dd-item:last-child {
          margin-bottom: 0;
        }

        .loginmenu-dd-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: ${theme.text};
        }

        .loginmenu-dd-icon {
          margin-right: ${theme.space[3]};
          color: ${theme.textTertiary};
          flex-shrink: 0;
          transition: color 0.15s ease;
        }

        .loginmenu-dd-item:hover .loginmenu-dd-icon {
          color: ${theme.text};
        }

        .loginmenu-invite-item {
          background: ${theme.primary}12;
          color: ${theme.primary};
          font-weight: 600;
          position: relative;
        }

        .loginmenu-invite-item::after {
          content: '';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 3px;
          background: ${theme.primary};
          border-radius: 50%;
          box-shadow: 0 0 4px ${theme.primary}60;
          animation: pulse 2.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateY(-50%) scale(1.4); }
        }

        .loginmenu-invite-item .loginmenu-dd-icon {
          color: ${theme.primary};
        }

        .loginmenu-invite-item:hover {
          background: ${theme.primary}20;
          color: ${theme.primary};
        }

        .loginmenu-logout-item:hover {
          background: ${theme.error}12;
          color: ${theme.error};
        }

        .loginmenu-logout-item:hover .loginmenu-dd-icon {
          color: ${theme.error};
        }

        .loginmenu-user-item {
          color: ${theme.textSecondary};
        }

        .loginmenu-user-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: ${theme.text};
        }

        .loginmenu-users-section {
          margin-bottom: ${theme.space[3]};
        }

        .loginmenu-bottom-section {
          margin-top: ${theme.space[3]};
          padding-top: ${theme.space[2]};
          position: relative;
        }

        .loginmenu-bottom-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: ${theme.space[3]};
          right: ${theme.space[3]};
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
        }
      `}
    </style>
  );
};

export const LoggedInMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const users = useAppSelector(selectUsers);
  const currentUserId = useAppSelector(selectUserId);

  const handleUserChange = (user: User) => {
    dispatch(changeUser(user));
  };

  const handleLogout = () => {
    dispatch(signOut())
      .unwrap()
      .then(() => navigate("/"));
  };

  const handleInviteFriend = async () => {
    const inviteUrl = `/invite-signup?inviterId=${currentUserId}`;
    const fullUrl = window.location.origin + inviteUrl;

    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("邀请链接已复制", {
        duration: 2500,
        position: "top-center",
      });
    } catch {
      toast.error("复制失败，请重试");
    }
  };

  const MenuItem = ({ label, icon, onClick, itemKey, className = "" }: any) => (
    <button
      key={itemKey}
      onClick={onClick}
      className={`loginmenu-dd-item ${className}`}
    >
      {icon && <span className="loginmenu-dd-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );

  const otherUsers = users.filter((user) => user !== auth.user && user);

  return (
    <>
      <div className="loginmenu-wrapper">
        <Tooltip content="当前登录账户" placement="bottom">
          <NavLink
            to="/life"
            className={({ isActive }) =>
              `loginmenu-nav-link ${isActive ? "active" : ""}`
            }
          >
            <div className="loginmenu-user-trigger">
              <PersonIcon size={18} />
              <span className="loginmenu-user-trigger-text">
                {auth.user?.username}
              </span>
            </div>
          </NavLink>
        </Tooltip>

        <DropdownMenu
          trigger={
            <button className="loginmenu-icon-button">
              <TriangleDownIcon size={16} />
            </button>
          }
          direction="bottom"
          triggerType="hover"
        >
          <div className="loginmenu-dd-wrapper">
            {otherUsers.length > 0 && (
              <div className="loginmenu-users-section">
                {otherUsers.map((user) => (
                  <MenuItem
                    itemKey={`user-${user.userId}`}
                    label={user.username}
                    icon={<PersonIcon size={16} />}
                    onClick={() => handleUserChange(user)}
                    className="loginmenu-user-item"
                  />
                ))}
              </div>
            )}

            <MenuItem
              itemKey="invite"
              label="邀请朋友"
              icon={<PlusIcon size={16} />}
              onClick={handleInviteFriend}
              className="loginmenu-invite-item"
            />

            <MenuItem
              itemKey="settings"
              label={t("settings")}
              icon={<GearIcon size={16} />}
              onClick={() => navigate(SettingRoutePaths.SETTING)}
            />

            <div className="loginmenu-bottom-section">
              <MenuItem
                itemKey="logout"
                label={t("logout")}
                icon={<SignOutIcon size={16} />}
                onClick={handleLogout}
                className="loginmenu-logout-item"
              />
            </div>
          </div>
        </DropdownMenu>
      </div>
      <MenuStyles />
    </>
  );
};
