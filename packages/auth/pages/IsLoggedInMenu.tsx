import React from "react";
import { DropDown } from "ui";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useNavigate } from "react-router-dom";
import OpenProps from "open-props";
import { PersonIcon, SignOutIcon, GearIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { flex } from "ui/styles";

import { changeCurrentUser, selectUsers, signOut } from "../authSlice";
import { getTokensFromLocalStorage, removeToken } from "../client/token";
import { parseToken } from "../token";
import { useAuth } from "../useAuth";

export const IsLoggedInMenu = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const users = useAppSelector(selectUsers);
  const currentToken = useAppSelector((state) => state.auth.currentToken);

  const logout = () => {
    removeToken(currentToken);
    dispatch(signOut());
    navigate("/");
  };
  const changeUser = (user) => {
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

  return (
    <DropDown
      direction="left"
      trigger={
        <button
          type="button"
          className="p-[10px]"
          style={{
            borderRadius: OpenProps.radiusRound,
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
        style={{
          ...flex,
          width: "200px",
          gap: OpenProps.sizeFluid1,
        }}
      >
        {users.map(
          (user) =>
            user !== auth.user &&
            user && (
              <button
                key={user.userId}
                type="button"
                onClick={() => changeUser(user)}
                className="px-2"
              >
                {user.username}
              </button>
            ),
        )}
        <button
          type="button"
          onMouseDown={logout}
          className="p-[10px]"
          style={{
            borderRadius: OpenProps.radiusRound,
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
            borderRadius: OpenProps.radiusRound,
          }}
        >
          <GearIcon size={24} />
          {/* {t("settings")} */}
        </button>
      </div>
    </DropDown>
  );
};
