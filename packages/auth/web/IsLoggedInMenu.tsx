import {
  GearIcon,
  PersonIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import {
  selectUsers,
  signOut,
  selectCurrentToken,
  changeUser,
} from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import DropDown from "render/ui/DropDown";
import { SettingRoutePaths } from "setting/config";

const StyleSheet = () => {
  const theme = useAppSelector(selectTheme);
  return (
    <style>
      {`
		.menu-wrapper {
		  display: flex;
		  align-items: center;
		  padding: 10px 16px;
		  gap: 1px; // 添加小间距避免边界出现缝隙
		}
  
		.icon-button {
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
  
		.icon-button:hover {
		  background-color: ${theme.primaryGhost};
		  color: ${theme.primary};
		}
  
		.nav-link {
		  text-decoration: none;
		  color: ${theme.text};
		}
  
		.nav-link.active .user-trigger {
		  background-color: ${theme.primaryGhost};
		  color: ${theme.primary};
		}
  
		.nav-link:hover .user-trigger {
		  background-color: ${theme.primaryGhost};
		  color: ${theme.primary};
		}
  
		.user-trigger {
		  display: flex;
		  align-items: center;
		  cursor: pointer;
		  padding: 6px 10px;
		  transition: all 0.2s ease;
		  color: ${theme.textSecondary};
		}
  
		.user-trigger-text {
		  font-size: 14px;
		  font-weight: 500;
		  margin-left: 8px;
		}
  
		.dropdown-wrapper {
		  padding: 6px;
		  min-width: 200px;
		  background-color: ${theme.background};
		  border-radius: 6px;
		  box-shadow: 0 4px 16px ${theme.shadowMedium};
		  border: 1px solid ${theme.borderHover};
		}
  
		.dropdown-item {
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
  
		.dropdown-item:hover {
		  background-color: ${theme.primaryGhost};
		  color: ${theme.primary};
		}
  
		.dropdown-item:hover .dropdown-icon {
		  color: ${theme.primary};
		}
  
		.dropdown-icon {
		  margin-right: 8px;
		  color: ${theme.textTertiary};
		  transition: all 0.2s ease;
		}
  
		/* 当username处于active状态时,让下拉按钮也融合进去 */
		.nav-link.active + .icon-button {
		  background-color: ${theme.primaryGhost};
		  color: ${theme.primary};
		}
	  `}
    </style>
  );
};

export const IsLoggedInMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const users = useAppSelector(selectUsers);
  const currentToken = useAppSelector(selectCurrentToken);

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
    <button key={key} onClick={onClick} className="dropdown-item">
      {icon && <span className="dropdown-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <div className="menu-wrapper">
        <NavLink
          to="/life"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <div className="user-trigger">
            <PersonIcon size={20} />
            <span className="user-trigger-text">{auth.user?.username}</span>
          </div>
        </NavLink>

        <DropDown
          trigger={
            <button className="icon-button">
              <TriangleDownIcon size={20} />
            </button>
          }
          direction="bottom"
          triggerType="hover"
        >
          <div className="dropdown-wrapper">
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
              t("common:settings"),
              <GearIcon size={16} />,
              () => navigate(SettingRoutePaths.SETTING),
              "settings"
            )}

            {renderDropdownItem(
              t("common:logout"),
              <SignOutIcon size={16} />,
              handleLogout,
              "logout"
            )}
          </div>
        </DropDown>
      </div>
      <StyleSheet />
    </>
  );
};
