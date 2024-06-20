import React from "react";
import {
  CommentIcon,
  HomeIcon,
  PersonIcon,
  SignOutIcon,
  GearIcon,
  SignInIcon,
} from "@primer/octicons-react";

import Shadows from "open-props/src/shadows";
import Sizes from "open-props/src/sizes";
import Borders from "open-props/src/borders";
import { DropDown } from "ui";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "auth/useAuth";
import { changeCurrentUser, signOut } from "auth/authSlice";

import { useAppDispatch, useAppSelector } from "app/hooks";
import { getTokensFromLocalStorage, removeToken } from "auth/client/token";
import { CreateMenu } from "create/blocks/CreateMenu";

import { RoutePaths } from "auth/client/routes";

const IsLoggedInMenu = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentToken = useAppSelector((state) => state.auth.currentToken);

  const logout = () => {
    removeToken(currentToken);
    dispatch(signOut());
    navigate("/");
  };
  return (
    <DropDown
      direction="left"
      trigger={
        <button
          type="button"
          className="p-[10px]"
          style={{
            borderRadius: Borders["--radius-round"],
          }}
          onMouseDown={() => {
            navigate("/life");
          }}
        >
          <PersonIcon />
        </button>
      }
      triggerType="hover"
    >
      <div
        className="flex "
        style={{
          gap: Sizes["--size-fluid-1"],
          width: Sizes["--size-fluid-7"],
        }}
      >
        <button
          type="button"
          onMouseDown={logout}
          className="p-[10px]"
          style={{
            borderRadius: Borders["--radius-round"],
          }}
        >
          <SignOutIcon size={24} />
          {/* {t("sign_out")} */}
        </button>
        <button
          type="button"
          onMouseDown={() => navigate("/settings")}
          className="p-[10px]"
          style={{
            borderRadius: Borders["--radius-round"],
          }}
        >
          <GearIcon size={24} />
          {/* {t("settings")} */}
        </button>
      </div>
    </DropDown>
  );
};

export const FloatMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        bottom: Sizes["--size-fluid-6"],
        right: Sizes["--size-fluid-3"],
        gap: Sizes["--size-relative-7"],
      }}
    >
      <button
        type="button"
        className="p-[10px]"
        style={{
          borderRadius: Borders["--radius-round"],
        }}
        onMouseDown={() => {
          navigate("/");
        }}
      >
        <HomeIcon />
      </button>
      {isLoggedIn && <CreateMenu />}
      <button
        type="button"
        className="p-[10px]"
        style={{
          borderRadius: Borders["--radius-round"],
        }}
        onMouseDown={() => {
          navigate("/chat");
        }}
      >
        <CommentIcon />
      </button>

      {isLoggedIn ? (
        <IsLoggedInMenu />
      ) : (
        <div>
          <button
            className="p-[10px]"
            style={{
              borderRadius: Borders["--radius-round"],
              boxShadow: Shadows["--shadow-5"],
            }}
            onClick={() => {
              navigate(RoutePaths.LOGIN);
            }}
          >
            <SignInIcon size={24} />
            {/* {t("login")} */}
          </button>
        </div>
      )}
    </div>
  );
};
{
  /* <div className="rounded-md bg-white py-1 shadow-lg">
{users.map(
  (user) =>
    user !== auth.user &&
    user && (
      <button
        key={user.userId}
        type="button"
        onClick={() => changeUser(user)}
        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
      >
        {t("change_to")} {user.username}
      </button>
    ),
)}
</div> */
}

// const changeUser = (user) => {
//   const tokens = getTokensFromLocalStorage();
//   const updatedToken = tokens.find(
//     (t) => parseToken(t).userId === user.userId,
//   );

//   if (updatedToken) {
//     const newTokens = [
//       updatedToken,
//       ...tokens.filter((t) => t !== updatedToken),
//     ];
//     window.localStorage.setItem("tokens", JSON.stringify(newTokens));
//     dispatch(changeCurrentUser({ user, token: updatedToken }));
//   }
// };
