import React from "react";
import { Button, DropDown } from "render/ui";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useNavigate } from "react-router-dom";
import OpenProps from "open-props";
import { PersonIcon, SignOutIcon, GearIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { flex } from "render/ui/styles";
import { Tooltip } from "@primer/react/next";
import { circleButtonStyle } from "render/button/style";

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
        <Tooltip text={"chat"} direction="n">
          <div>
            <Button
              style={circleButtonStyle}
              icon={<PersonIcon />}
              onClick={() => {
                navigate("/life");
              }}
            />
          </div>
        </Tooltip>
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

        <Tooltip text={t("sign_out")} direction="n">
          <div>
            <Button
              style={circleButtonStyle}
              icon={<SignOutIcon />}
              onClick={logout}
            />
          </div>
        </Tooltip>

        <Tooltip text={t("settings")} direction="n">
          <div>
            <Button
              style={circleButtonStyle}
              icon={<GearIcon size={24} />}
              onClick={() => navigate("/settings")}
            />
          </div>
        </Tooltip>
      </div>
    </DropDown>
  );
};
