import {
  GearIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectUsers, signOut, changeUser, selectUserId } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import DropdownMenu from "web/ui/DropDownMenu";
import { SettingRoutePaths } from "setting/config";
import { Tooltip } from "render/web/ui/Tooltip";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

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
          min-width: 44px;
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .loginmenu-icon-button:hover {
          background-color: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .loginmenu-icon-button:active {
          background-color: ${theme.backgroundSelected};
          transform: scale(0.96);
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
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .loginmenu-user-trigger:active {
          background-color: ${theme.backgroundSelected};
          transform: scale(0.98);
        }

        .loginmenu-user-trigger-text {
          font-size: 14px;
          font-weight: 500;
          margin-left: ${theme.space[2]};
        }

        .loginmenu-dd-wrapper {
          padding: ${theme.space[2]};
          min-width: 200px;
          background: ${theme.background};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 12px;
          box-shadow: 
            0 8px 32px ${theme.shadowMedium},
            0 2px 8px ${theme.shadowLight};
          border: 1px solid ${theme.border};
          margin-top: ${theme.space[2]};
        }

        .loginmenu-dd-item {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          padding: ${theme.space[3]} ${theme.space[3]};
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s ease;
          color: ${theme.text};
          font-size: 14px;
          font-weight: 500;
          margin-bottom: ${theme.space[1]};
          min-height: 48px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          position: relative;
        }

        .loginmenu-dd-item:last-child {
          margin-bottom: 0;
        }

        .loginmenu-dd-item:hover {
          background-color: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .loginmenu-dd-item:active {
          background-color: ${theme.backgroundSelected};
          transform: scale(0.98);
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
          background: ${theme.primary}10;
          color: ${theme.primary};
          font-weight: 600;
        }

        .loginmenu-invite-item .loginmenu-dd-icon {
          color: ${theme.primary};
        }

        .loginmenu-invite-item:hover {
          background: ${theme.primary}18;
        }

        .loginmenu-invite-item:active {
          background: ${theme.primary}25;
        }

        .loginmenu-user-section {
          margin-bottom: ${theme.space[3]};
        }

        .loginmenu-action-section {
          margin-top: ${theme.space[3]};
          padding-top: ${theme.space[2]};
          border-top: 1px solid ${theme.borderLight};
        }

        .loginmenu-logout-item:hover {
          background: ${theme.error}10;
          color: ${theme.error};
        }

        .loginmenu-logout-item:active {
          background: ${theme.error}18;
          color: ${theme.error};
        }

        .loginmenu-logout-item:hover .loginmenu-dd-icon {
          color: ${theme.error};
        }

        /* 移动端优化 */
        @media (max-width: 768px) {
          .loginmenu-dd-wrapper {
            min-width: 240px;
            box-shadow: 
              0 12px 48px ${theme.shadowMedium},
              0 4px 16px ${theme.shadowLight};
          }

          .loginmenu-dd-item {
            min-height: 52px;
            padding: ${theme.space[4]} ${theme.space[3]};
            font-size: 16px;
          }

          .loginmenu-user-trigger {
            min-height: 48px;
            padding: ${theme.space[3]} ${theme.space[3]};
          }

          .loginmenu-icon-button {
            min-width: 48px;
            min-height: 48px;
          }
        }

        /* 触摸反馈动画 */
        @media (pointer: coarse) {
          .loginmenu-dd-item:active,
          .loginmenu-user-trigger:active,
          .loginmenu-icon-button:active {
            transition: all 0.1s ease;
          }
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
  const [isMobile, setIsMobile] = useState(false);

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    try {
      await navigator.clipboard.writeText(window.location.origin + inviteUrl);
      toast.success("邀请链接已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const renderDropdownItem = (
    label: string,
    icon?: React.ReactNode,
    onClick?: () => void,
    key: string,
    className = ""
  ) => (
    <button
      key={key}
      onClick={onClick}
      className={`loginmenu-dd-item ${className}`}
      // 移动端优化：添加触摸事件
      onTouchStart={() => {}}
    >
      {icon && <span className="loginmenu-dd-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );

  const otherUsers = users.filter((user) => user !== auth.user && user);

  return (
    <>
      <div className="loginmenu-wrapper">
        <Tooltip
          content="当前登录账户"
          placement="bottom"
          disabled={isMobile} // 移动端禁用Tooltip
        >
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
            <button
              className="loginmenu-icon-button"
              onTouchStart={() => {}} // 优化触摸响应
            >
              <TriangleDownIcon size={16} />
            </button>
          }
          direction="bottom"
          triggerType={isMobile ? "click" : "hover"} // 根据设备类型选择触发方式
        >
          <div className="loginmenu-dd-wrapper">
            {otherUsers.length > 0 && (
              <div className="loginmenu-user-section">
                {otherUsers.map((user) =>
                  renderDropdownItem(
                    user.username,
                    <PersonIcon size={16} />,
                    () => handleUserChange(user),
                    `user-${user.userId}`
                  )
                )}
              </div>
            )}

            {renderDropdownItem(
              "邀请朋友",
              <PlusIcon size={16} />,
              handleInviteFriend,
              "invite",
              "loginmenu-invite-item"
            )}

            <div className="loginmenu-action-section">
              {renderDropdownItem(
                t("settings"),
                <GearIcon size={16} />,
                () => navigate(SettingRoutePaths.SETTING),
                "settings"
              )}

              {renderDropdownItem(
                t("logout"),
                <SignOutIcon size={16} />,
                handleLogout,
                "logout",
                "loginmenu-logout-item"
              )}
            </div>
          </div>
        </DropdownMenu>
      </div>
      <MenuStyles />
    </>
  );
};
