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
import { useAppDispatch, useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
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
import DropdownMenu from "render/web/ui/DropDownMenu";
import { SettingRoutePaths } from "app/settings/config";
import { Tooltip } from "render/web/ui/Tooltip";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useBalance } from "auth/hooks/useBalance";

export const LoggedInMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const users = useAppSelector(selectUsers);
  const currentUserId = useAppSelector(selectUserId);
  const theme = useAppSelector(selectTheme);
  const [isMobile, setIsMobile] = useState(false);
  const { balance, loading, error } = useBalance();

  const isLowBalance = !loading && !error && balance < 10;

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
    <button key={key} onClick={onClick} className={`dd-item ${className}`}>
      {icon && <span className="dd-icon">{icon}</span>}
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
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="user-trigger">
              <PersonIcon size={16} />
              <span className="user-trigger-text">{auth.user?.username}</span>
            </div>
          </NavLink>
        </Tooltip>

        <DropdownMenu
          trigger={
            <button className="icon-button">
              <TriangleDownIcon size={14} />
            </button>
          }
          direction="bottom"
          triggerType={isMobile ? "click" : "hover"}
        >
          <div className="dd-wrapper">
            {otherUsers.length > 0 && (
              <div className="user-section">
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

            <div className="balance-section">
              <div className="balance-info">
                <CreditCardIcon size={14} />
                <span>{t("balance", "余额")}:</span>
                <span className="balance-amount">
                  {loading ? "..." : error ? "N/A" : `¥ ${balance.toFixed(2)}`}
                </span>
              </div>
              <button className="recharge-button" onClick={handleRecharge}>
                {t("recharge", "充值")}
              </button>
            </div>

            {renderDropdownItem(
              "邀请朋友",
              <PlusIcon size={14} />,
              handleInviteFriend,
              "invite",
              "invite-item"
            )}

            <div className="action-section">
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
                "logout-item"
              )}
            </div>
          </div>
        </DropdownMenu>
      </div>

      <style href={"loginmenu" + theme.background} precedence="medium">
        {`
          .loginmenu-wrapper {
            display: flex; align-items: center; gap: ${theme.space[1]};
            padding: ${theme.space[1]} ${theme.space[3]};
          }

          .icon-button {
            background: transparent; border: none; cursor: pointer;
            padding: ${theme.space[2]}; display: flex; align-items: center;
            justify-content: center; border-radius: 4px; transition: all 0.15s ease;
            color: ${theme.textTertiary}; min-width: 32px; min-height: 32px;
            -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          }
          .icon-button:hover {
            background-color: ${theme.backgroundHover}; color: ${theme.textSecondary};
          }
          .icon-button:active {
            background-color: ${theme.backgroundSelected}; transform: scale(0.95);
          }

          .nav-link {
            text-decoration: none; color: inherit; display: block;
          }
          .nav-link.active .user-trigger {
            background-color: ${theme.backgroundSelected}; color: ${theme.text};
          }
          .nav-link:hover .user-trigger {
            background-color: ${theme.backgroundHover}; color: ${theme.text};
          }

          .user-trigger {
            display: flex; align-items: center; cursor: pointer;
            padding: ${theme.space[2]}; border-radius: 4px; transition: all 0.15s ease;
            color: ${theme.textSecondary}; min-height: 32px;
            -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          }
          .user-trigger:active {
            background-color: ${theme.backgroundSelected}; transform: scale(0.98);
          }

          .user-trigger-text {
            font-size: 13px; font-weight: 400; margin-left: ${theme.space[2]};
            letter-spacing: 0.01em;
          }

          .dd-wrapper {
            padding: ${theme.space[1]}; min-width: 220px; background: ${theme.background};
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-radius: 8px; margin-top: ${theme.space[1]};
            box-shadow: 0 4px 20px ${theme.shadowLight}, 0 1px 4px ${theme.shadowMedium};
            border: 1px solid ${theme.borderLight};
          }

          .dd-item {
            display: flex; align-items: center; width: 100%; text-align: left;
            padding: ${theme.space[2]} ${theme.space[3]}; border: none;
            background: transparent; cursor: pointer; border-radius: 4px;
            transition: all 0.15s ease; color: ${theme.textSecondary};
            font-size: 13px; font-weight: 400; margin-bottom: 1px;
            min-height: 36px; -webkit-tap-highlight-color: transparent;
            touch-action: manipulation; letter-spacing: 0.01em;
          }
          .dd-item:last-child { margin-bottom: 0; }
          .dd-item:hover {
            background-color: ${theme.backgroundHover}; color: ${theme.text};
          }
          .dd-item:hover .dd-icon { color: ${theme.textSecondary}; }
          .dd-item:active {
            background-color: ${theme.backgroundSelected}; transform: scale(0.98);
          }

          .dd-icon {
            margin-right: ${theme.space[2]}; color: ${theme.textQuaternary};
            flex-shrink: 0; transition: color 0.15s ease;
          }

          .balance-section {
            display: flex; align-items: center; justify-content: space-between;
            padding: ${theme.space[2]} ${theme.space[3]}; margin: ${theme.space[1]} 0;
            border-top: 1px solid ${theme.borderLight};
            border-bottom: 1px solid ${theme.borderLight};
          }

          .balance-info {
            display: flex; align-items: center; gap: ${theme.space[2]};
            font-size: 13px; color: ${theme.textSecondary};
          }

          .balance-amount {
            font-weight: 600; color: ${isLowBalance ? theme.error : theme.primary};
          }

          .recharge-button {
            font-size: 12px; font-weight: 500;
            padding: ${theme.space[1]} ${theme.space[2]};
            background-color: ${theme.primary}1A; color: ${theme.primary};
            border: none; border-radius: 4px; cursor: pointer;
            transition: all 0.15s ease;
          }
          .recharge-button:hover {
            background-color: ${theme.primary}2A;
          }
          .recharge-button:active {
            background-color: ${theme.primary}3A; transform: scale(0.97);
          }

          .invite-item {
            background: ${theme.primary}08; color: ${theme.primary}; font-weight: 450;
          }
          .invite-item .dd-icon { color: ${theme.primary}; }
          .invite-item:hover { background: ${theme.primary}12; }

          .action-section { margin-top: ${theme.space[1]}; }

          .logout-item:hover {
            background: ${theme.error}08; color: ${theme.error};
          }
          .logout-item:hover .dd-icon { color: ${theme.error}; }
        `}
      </style>
    </>
  );
};
