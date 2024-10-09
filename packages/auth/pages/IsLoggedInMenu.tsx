import React from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { PersonIcon, GearIcon, SignOutIcon } from "@primer/octicons-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DropDown from "render/ui/DropDown";
import { useSelector } from "react-redux";

import { signOut, changeCurrentUser, selectUsers } from "auth/authSlice";
import { removeToken, getTokensFromLocalStorage } from "auth/client/token";
import { useAuth } from "auth/useAuth";
import { parseToken } from "auth/token";
import { selectTheme } from "app/theme/themeSlice";

const IconButton: React.FC<{
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ icon, to, onClick, isActive }) => {
  const theme = useAppSelector(selectTheme);

  const content = (
    <button
      onClick={onClick}
      style={{
        background: isActive ? theme.surface2 : "none",
        border: "none",
        cursor: "pointer",
        padding: theme.spacing.small,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        transition: "background-color 0.2s",
        color: theme.text1,
      }}
      onMouseEnter={(e) =>
        !isActive && (e.currentTarget.style.backgroundColor = theme.surface3)
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
  const theme = useAppSelector(selectTheme);

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
  const currentToken = useSelector((state: any) => state.auth.currentToken);

  const logout = () => {
    removeToken(currentToken);
    dispatch(signOut());
    navigate("/");
  };

  const isLifeActive = location.pathname === "/life";

  const userTrigger = (
    <NavLink
      to="/life"
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        textDecoration: "none",
        color: theme.text1,
        padding: theme.spacing.small,
        borderRadius: theme.borderRadius,
        transition: "background-color 0.2s",
        backgroundColor: isLifeActive ? theme.surface2 : "transparent",
      }}
      onMouseEnter={(e) =>
        !isLifeActive &&
        (e.currentTarget.style.backgroundColor = theme.surface3)
      }
      onMouseLeave={(e) =>
        !isLifeActive && (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <PersonIcon
        size={theme.iconSize.medium}
        style={{ marginRight: theme.spacing.small }}
      />
      <span style={{ fontSize: theme.fontSize.medium, fontWeight: "500" }}>
        {auth.user?.username}
      </span>
    </NavLink>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.large,
        padding: `${theme.spacing.small} ${theme.spacing.medium}`,
        backgroundColor: theme.surface1,
        borderRadius: theme.borderRadius,
        boxShadow: `0 2px 10px ${theme.shadowColor}`,
      }}
    >
      <DropDown trigger={userTrigger} direction="bottom" triggerType="click">
        <div
          style={{
            padding: theme.spacing.small,
            minWidth: "150px",
            backgroundColor: theme.surface1,
            borderRadius: theme.borderRadius,
            boxShadow: `0 2px 10px ${theme.shadowColor}`,
          }}
        >
          {users.map(
            (user) =>
              user !== auth.user &&
              user && (
                <button
                  key={user.userId}
                  onClick={() => changeUser(user)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: theme.spacing.small,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: theme.borderRadius,
                    transition: "background-color 0.2s",
                    color: theme.text1,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = theme.surface2)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {user.username}
                </button>
              ),
          )}
        </div>
      </DropDown>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.medium,
        }}
      >
        <IconButton
          icon={<GearIcon size={theme.iconSize.medium} />}
          to="/settings"
          isActive={location.pathname === "/settings"}
        />
        <IconButton
          icon={<SignOutIcon size={theme.iconSize.medium} />}
          onClick={logout}
        />
      </div>
    </div>
  );
};
