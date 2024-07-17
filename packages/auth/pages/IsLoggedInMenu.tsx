import React from "react";
import { DropDown } from "render/ui";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useNavigate } from "react-router-dom";
import OpenProps from "open-props";
import { PersonIcon, SignOutIcon, GearIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { flex } from "render/ui/styles";
import { CircleButton } from "render/button/CircleButton";

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
        <CircleButton
          tooltip="chat"
          icon={<PersonIcon size="medium" />}
          onClick={() => navigate("/life")}
        />
      }
      triggerType="hover"
    >
      <div
        style={{
          ...flex,
          flexDirection: "row-reverse",
          width: "120px",
          gap: OpenProps.sizeFluid1,
          paddingRight: OpenProps.sizeFluid1,
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

        <CircleButton
          tooltip={t("settings")}
          icon={<GearIcon size="medium" />}
          onClick={() => navigate("/settings")}
        />

        <CircleButton
          tooltip={t("sign_out")}
          icon={<SignOutIcon size="medium" />}
          onClick={logout}
        />
      </div>
    </DropDown>
  );
};
