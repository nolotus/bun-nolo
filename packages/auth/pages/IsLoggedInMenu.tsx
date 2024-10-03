import React from "react";
import { DropDown } from "render/ui";
import { useAppDispatch, useAppSelector } from "app/hooks";
import OpenProps from "open-props";
import { PersonIcon } from "@primer/octicons-react";
import { flex } from "render/ui/styles";
import { CircleButton } from "render/button/CircleButton";

import { changeCurrentUser, selectUsers } from "../authSlice";
import { getTokensFromLocalStorage } from "../client/token";
import { parseToken } from "../token";
import { useAuth } from "../useAuth";

export const IsLoggedInMenu = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const users = useAppSelector(selectUsers);

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
          tooltip="个人中心"
          icon={<PersonIcon size={24} />}
          to="/life"
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
      </div>
    </DropDown>
  );
};
