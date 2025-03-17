import {
  GearIcon,
  PersonIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectUsers, signOut, changeUser } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import DropdownMenu from "web/ui/DropdownMenu";
import { SettingRoutePaths } from "setting/config";
import { Tooltip } from "web/ui/Tooltip";

const MenuStyles = () => {
  const theme = useAppSelector(selectTheme);
  return (
    <style>
      {`
        .loginmenu-wrapper {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          gap: 1px;
        }

        .loginmenu-icon-button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: ${theme.textSecondary};
        }

        .loginmenu-icon-button:hover {
          background-color: ${theme.primaryGhost};
          color: ${theme.primary};
        }

        .loginmenu-nav-link {
          text-decoration: none;
          color: ${theme.text};
        }

        .loginmenu-nav-link.active .loginmenu-user-trigger {
          background-color: ${theme.primaryGhost};
          color: ${theme.primary};
        }

        .loginmenu-nav-link:hover .loginmenu-user-trigger {
          background-color: ${theme.primaryGhost};
          color: ${theme.primary};
        }

        .loginmenu-user-trigger {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 6px 10px;
          transition: all 0.2s ease;
          color: ${theme.textSecondary};
        }

        .loginmenu-user-trigger-text {
          font-size: 14px;
          font-weight: 500;
          margin-left: 8px;
        }

        .loginmenu-dd-wrapper {
          padding: 6px;
          min-width: 200px;
          background-color: ${theme.background};
          border-radius: 6px;
          box-shadow: 0 4px 16px ${theme.shadowMedium};
          border: 1px solid ${theme.borderHover};
        }

        .loginmenu-dd-item {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${theme.textSecondary};
          font-size: 13px;
          font-weight: 500;
        }

        .loginmenu-dd-item:hover {
          background-color: ${theme.primaryGhost};
          color: ${theme.primary};
        }

        .loginmenu-dd-item:hover .loginmenu-dd-icon {
          color: ${theme.primary};
        }

        .loginmenu-dd-icon {
          margin-right: 8px;
          color: ${theme.textTertiary};
          transition: all 0.2s ease;
        }

        .loginmenu-nav-link.active + .loginmenu-icon-button {
          background-color: ${theme.primaryGhost};
          color: ${theme.primary};
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

  const handleUserChange = (user: User) => {
    dispatch(changeUser(user));
  };

  const handleLogout = () => {
    dispatch(signOut())
      .unwrap()
      .then(() => navigate("/"));
  };

  const renderDropdownItem = (
    label: string,
    icon?: React.ReactNode,
    onClick?: () => void,
    key: string
  ) => (
    <button key={key} onClick={onClick} className="loginmenu-dd-item">
      {icon && <span className="loginmenu-dd-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );

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
              <PersonIcon size={20} />
              <span className="loginmenu-user-trigger-text">
                {auth.user?.username}
              </span>
            </div>
          </NavLink>
        </Tooltip>

        <DropdownMenu
          trigger={
            <button className="loginmenu-icon-button">
              <TriangleDownIcon size={20} />
            </button>
          }
          direction="bottom"
          triggerType="hover"
        >
          <div className="loginmenu-dd-wrapper">
            {users.map(
              (user) =>
                user !== auth.user &&
                user &&
                renderDropdownItem(
                  user.username,
                  null,
                  () => handleUserChange(user),
                  `user-${user.userId}`
                )
            )}

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
              "logout"
            )}
          </div>
        </DropdownMenu>
      </div>
      <MenuStyles />
    </>
  );
};
