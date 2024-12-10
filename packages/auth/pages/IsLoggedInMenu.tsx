import React from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  PersonIcon,
  GearIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DropDown from "render/ui/DropDown";
import { useSelector } from "react-redux";
import { signOut, changeCurrentUser, selectUsers } from "auth/authSlice";
import { removeToken, getTokensFromLocalStorage } from "auth/client/token";
import { useAuth } from "auth/useAuth";
import { parseToken } from "auth/token";
import { SettingRoutePaths } from "setting/config";
import { COLORS } from "render/styles/colors";

const styles = {
  menu: {
    wrapper: {
      display: "flex",
      alignItems: "center",
      padding: "10px 16px",
    },
  },

  iconButton: {
    base: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      transition: "all 0.15s ease",
      color: COLORS.text,
    },
    active: {
      backgroundColor: COLORS.backgroundGhost,
    },
    hover: {
      backgroundColor: COLORS.backgroundGhost,
    },
  },

  userTrigger: {
    base: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      textDecoration: "none",
      color: COLORS.text,
      padding: "6px 10px",
      borderRadius: "6px",
      transition: "all 0.15s ease",
    },
    active: {
      backgroundColor: COLORS.backgroundGhost,
    },
    hover: {
      backgroundColor: COLORS.backgroundGhost,
    },
    text: {
      fontSize: "14px",
      fontWeight: "500",
      marginLeft: "6px",
    },
  },

  dropDown: {
    wrapper: {
      padding: "8px",
      minWidth: "200px",
      backgroundColor: COLORS.background,
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      border: `1px solid ${COLORS.border}`,
    },
    item: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      textAlign: "left",
      padding: "8px 12px",
      border: "none",
      background: "none",
      cursor: "pointer",
      borderRadius: "6px",
      transition: "all 0.15s ease",
      color: COLORS.text,
      fontSize: "13px",
      fontWeight: 500,
    },
  },
};

const IconButton: React.FC<{
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ icon, to, onClick, isActive }) => {
  const buttonStyle = {
    ...styles.iconButton.base,
    ...(isActive ? styles.iconButton.active : {}),
  };

  const content = (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) =>
        !isActive &&
        (e.currentTarget.style.backgroundColor =
          styles.iconButton.hover.backgroundColor)
      }
      onMouseLeave={(e) =>
        !isActive && (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      {icon}
    </button>
  );

  if (to) {
    return (
      <NavLink to={to} style={{ color: "inherit", textDecoration: "none" }}>
        {content}
      </NavLink>
    );
  }
  return content;
};

export const IsLoggedInMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const location = useLocation();
  const isLifeActive = location.pathname === "/life";

  const changeUser = (user: any) => {
    const tokens = getTokensFromLocalStorage();
    const updatedToken = tokens.find(
      (t) => parseToken(t).userId === user.userId
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

  const currentToken = useSelector((state: any) => state.auth.currentToken);

  const logout = () => {
    removeToken(currentToken);
    dispatch(signOut());
    navigate("/");
  };

  const userTrigger = (
    <div
      style={{
        ...styles.userTrigger.base,
        ...(isLifeActive ? styles.userTrigger.active : {}),
      }}
      onMouseEnter={(e) =>
        !isLifeActive &&
        (e.currentTarget.style.backgroundColor =
          styles.userTrigger.hover.backgroundColor)
      }
      onMouseLeave={(e) =>
        !isLifeActive && (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <PersonIcon size={20} />
      <span style={styles.userTrigger.text}>{auth.user?.username}</span>
    </div>
  );

  return (
    <div style={styles.menu.wrapper}>
      <NavLink
        to="/life"
        style={{ textDecoration: "none", color: COLORS.text }}
      >
        {userTrigger}
      </NavLink>

      <DropDown
        trigger={
          <IconButton
            icon={<TriangleDownIcon size={20} />}
            onClick={() => {}}
          />
        }
        direction="bottom"
        triggerType="click"
      >
        <div style={styles.dropDown.wrapper}>
          {users.map(
            (user) =>
              user !== auth.user &&
              user && (
                <button
                  key={user.userId}
                  onClick={() => changeUser(user)}
                  style={styles.dropDown.item}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      COLORS.backgroundGhost)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {user.username}
                </button>
              )
          )}

          <button
            onClick={() => navigate(SettingRoutePaths.SETTING)}
            style={styles.dropDown.item}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.backgroundGhost)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <GearIcon
              size={16}
              style={{ marginRight: "6px", color: COLORS.textSecondary }}
            />
            <span>{t("common:settings")}</span>
          </button>

          <button
            onClick={logout}
            style={styles.dropDown.item}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.backgroundGhost)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <SignOutIcon
              size={16}
              style={{ marginRight: "6px", color: COLORS.textSecondary }}
            />
            <span>{t("common:logout")}</span>
          </button>
        </div>
      </DropDown>
    </div>
  );
};
