import {
  GearIcon,
  PersonIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { changeCurrentUser, selectUsers, signOut } from "auth/authSlice";
import { getTokensFromLocalStorage, removeToken } from "auth/client/token";
import { parseToken } from "auth/token";
import { useAuth } from "auth/useAuth";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";
import DropDown from "render/ui/DropDown";
import { SettingRoutePaths } from "setting/config";

const StyleSheet = () => (
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
		  color: ${defaultTheme.textSecondary};
		}
  
		.icon-button:hover {
		  background-color: ${defaultTheme.primaryGhost};
		  color: ${defaultTheme.primary};
		}
  
		.nav-link {
		  text-decoration: none;
		  color: ${defaultTheme.text};
		}
  
		.nav-link.active .user-trigger {
		  background-color: ${defaultTheme.primaryGhost};
		  color: ${defaultTheme.primary};
		}
  
		.nav-link:hover .user-trigger {
		  background-color: ${defaultTheme.primaryGhost};
		  color: ${defaultTheme.primary};
		}
  
		.user-trigger {
		  display: flex;
		  align-items: center;
		  cursor: pointer;
		  padding: 6px 10px;
		  transition: all 0.2s ease;
		  color: ${defaultTheme.textSecondary};
		}
  
		.user-trigger-text {
		  font-size: 14px;
		  font-weight: 500;
		  margin-left: 8px;
		}
  
		.dropdown-wrapper {
		  padding: 6px;
		  min-width: 200px;
		  background-color: ${defaultTheme.background};
		  border-radius: 6px;
		  box-shadow: 0 4px 16px ${defaultTheme.shadowMedium};
		  border: 1px solid ${defaultTheme.borderHover};
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
		  color: ${defaultTheme.textSecondary};
		  font-size: 13px;
		  font-weight: 500;
		}
  
		.dropdown-item:hover {
		  background-color: ${defaultTheme.primaryGhost};
		  color: ${defaultTheme.primary};
		}
  
		.dropdown-item:hover .dropdown-icon {
		  color: ${defaultTheme.primary};
		}
  
		.dropdown-icon {
		  margin-right: 8px;
		  color: ${defaultTheme.textTertiary};
		  transition: all 0.2s ease;
		}
  
		/* 当username处于active状态时,让下拉按钮也融合进去 */
		.nav-link.active + .icon-button {
		  background-color: ${defaultTheme.primaryGhost};
		  color: ${defaultTheme.primary};
		}
	  `}
  </style>
);

export const IsLoggedInMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const currentToken = useSelector((state: any) => state.auth.currentToken);

  const changeUser = (user: any) => {
    const tokens = getTokensFromLocalStorage();
    const updatedToken = tokens.find(
      (t) => parseToken(t).userId === user.userId,
    );
    if (updatedToken) {
      const newTokens = [
        updatedToken,
        ...tokens.filter((t) => t !== updatedToken),
      ];
      dispatch(changeCurrentUser({ user, token: updatedToken }));
      window.localStorage.setItem("tokens", JSON.stringify(newTokens));
    }
  };

  const logout = () => {
    removeToken(currentToken);
    dispatch(signOut());
    navigate("/");
  };

  const renderDropdownItem = (
    label: string,
    icon?: React.ReactNode,
    onClick?: () => void,
  ) => (
    <button onClick={onClick} className="dropdown-item">
      {icon && <span className="dropdown-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <StyleSheet />
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
                renderDropdownItem(user.username, null, () => changeUser(user)),
            )}

            {renderDropdownItem(
              t("common:settings"),
              <GearIcon size={16} />,
              () => navigate(SettingRoutePaths.SETTING),
            )}

            {renderDropdownItem(
              t("common:logout"),
              <SignOutIcon size={16} />,
              logout,
            )}
          </div>
        </DropDown>
      </div>
    </>
  );
};
