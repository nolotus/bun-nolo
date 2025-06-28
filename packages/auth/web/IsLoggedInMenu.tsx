// auth/web/LoggedInMenu.tsx
import {
  GearIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
  TriangleDownIcon,
  CreditCardIcon,
  AlertIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import {
  selectUsers,
  signOut,
  changeUser,
  selectUserId,
  User,
} from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import DropdownMenu from "web/ui/DropDownMenu";
import { SettingRoutePaths } from "setting/config";
import { Tooltip } from "render/web/ui/Tooltip";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useBalance } from "auth/hooks/useBalance";

const MenuStyles = () => {
  const theme = useAppSelector(selectTheme);
  const { balance, loading, error } = useBalance();
  const isLowBalance = !loading && !error && balance < 10;

  return (
    <style href="loginmenu-styles" precedence="medium">
      {`
        .loginmenu-wrapper {
          display: flex;
          align-items: center;
          padding: ${theme.space[1]} ${theme.space[3]};
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
          border-radius: 4px;
          transition: all 0.12s ease;
          color: ${theme.textTertiary};
          min-width: 32px;
          min-height: 32px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .loginmenu-icon-button:hover {
          background-color: ${theme.backgroundHover};
          color: ${theme.textSecondary};
        }

        .loginmenu-icon-button:active {
          background-color: ${theme.backgroundSelected};
          transform: scale(0.95);
        }

        .loginmenu-nav-link {
          text-decoration: none;
          color: inherit;
          display: block;
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
          padding: ${theme.space[2]};
          border-radius: 4px;
          transition: all 0.12s ease;
          color: ${theme.textSecondary};
          min-height: 32px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .loginmenu-user-trigger:active {
          background-color: ${theme.backgroundSelected};
          transform: scale(0.98);
        }

        .loginmenu-user-trigger-text {
          font-size: 13px;
          font-weight: 400;
          margin-left: ${theme.space[2]};
          letter-spacing: 0.01em;
        }

        .loginmenu-dd-wrapper {
          padding: ${theme.space[1]};
          min-width: 220px;
          background: ${theme.background};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 8px;
          box-shadow: 
            0 4px 20px ${theme.shadowLight},
            0 1px 4px ${theme.shadowMedium};
          border: 1px solid ${theme.borderLight};
          margin-top: ${theme.space[1]};
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
          border-radius: 4px;
          transition: all 0.12s ease;
          color: ${theme.textSecondary};
          font-size: 13px;
          font-weight: 400;
          margin-bottom: 1px;
          min-height: 36px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          letter-spacing: 0.01em;
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
          margin-right: ${theme.space[2]};
          color: ${theme.textQuaternary};
          flex-shrink: 0;
          transition: color 0.12s ease;
        }

        .loginmenu-dd-item:hover .loginmenu-dd-icon {
          color: ${theme.textSecondary};
        }

        /* Balance Section Styles */
        .loginmenu-balance-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[2]} ${theme.space[3]};
          margin: ${theme.space[1]} 0;
          border-top: 1px solid ${theme.borderLight};
          border-bottom: 1px solid ${theme.borderLight};
        }

        .loginmenu-balance-info {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          font-size: 13px;
          color: ${theme.textSecondary};
        }
        
        .loginmenu-balance-amount {
          font-weight: 600;
          color: ${isLowBalance ? theme.error : theme.primary};
        }

        .loginmenu-recharge-button {
          font-size: 12px;
          font-weight: 500;
          padding: ${theme.space[1]} ${theme.space[2]};
          background-color: ${theme.primary}1A;
          color: ${theme.primary};
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .loginmenu-recharge-button:hover {
          background-color: ${theme.primary}2A;
          color: ${theme.primary};
        }
        
        .loginmenu-recharge-button:active {
           background-color: ${theme.primary}3A;
           transform: scale(0.97);
        }

        /* Other Item Sections */
        .loginmenu-invite-item {
          background: ${theme.primary}08;
          color: ${theme.primary};
          font-weight: 450;
        }

        .loginmenu-invite-item .loginmenu-dd-icon {
          color: ${theme.primary};
        }

        .loginmenu-invite-item:hover {
          background: ${theme.primary}12;
        }

        .loginmenu-action-section {
          margin-top: ${theme.space[1]};
        }

        .loginmenu-logout-item:hover {
          background: ${theme.error}08;
          color: ${theme.error};
        }

        .loginmenu-logout-item:hover .loginmenu-dd-icon {
          color: ${theme.error};
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
  const { balance, loading, error } = useBalance();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
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

  const handleRecharge = () => {
    navigate("/recharge");
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
    >
      {icon && <span className="loginmenu-dd-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );

  const otherUsers = users.filter(
    (user) => user && user.userId !== currentUserId
  );

  return (
    <>
      <div className="loginmenu-wrapper">
        <Tooltip content="当前登录账户" placement="bottom" disabled={isMobile}>
          <NavLink
            to="/life"
            className={({ isActive }) =>
              `loginmenu-nav-link ${isActive ? "active" : ""}`
            }
          >
            <div className="loginmenu-user-trigger">
              <PersonIcon size={16} />
              <span className="loginmenu-user-trigger-text">
                {auth.user?.username}
              </span>
            </div>
          </NavLink>
        </Tooltip>

        <DropdownMenu
          trigger={
            <button className="loginmenu-icon-button">
              <TriangleDownIcon size={14} />
            </button>
          }
          direction="bottom"
          triggerType={isMobile ? "click" : "hover"}
        >
          <div className="loginmenu-dd-wrapper">
            {otherUsers.length > 0 && (
              <div className="loginmenu-user-section">
                {otherUsers.map((user) =>
                  renderDropdownItem(
                    user.username,
                    <PersonIcon size={14} />,
                    () => handleUserChange(user),
                    `user-${user.userId}`
                  )
                )}
              </div>
            )}

            {/* Balance and Recharge Section */}
            <div className="loginmenu-balance-section">
              <div className="loginmenu-balance-info">
                <CreditCardIcon size={14} />
                <span>{t("balance", "余额")}:</span>
                <span className="loginmenu-balance-amount">
                  {loading ? "..." : error ? "N/A" : `¥ ${balance.toFixed(2)}`}
                </span>
              </div>
              <button
                className="loginmenu-recharge-button"
                onClick={handleRecharge}
              >
                {t("recharge", "充值")}
              </button>
            </div>

            {renderDropdownItem(
              "邀请朋友",
              <PlusIcon size={14} />,
              handleInviteFriend,
              "invite",
              "loginmenu-invite-item"
            )}

            <div className="loginmenu-action-section">
              {renderDropdownItem(
                t("settings"),
                <GearIcon size={14} />,
                () => navigate(SettingRoutePaths.SETTING),
                "settings"
              )}
              {renderDropdownItem(
                t("logout"),
                <SignOutIcon size={14} />,
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
