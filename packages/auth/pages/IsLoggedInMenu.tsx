import React from "react";
import { DropDown } from "render/ui";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { PersonIcon } from "@primer/octicons-react";
import { Tooltip } from "@primer/react/next";
import { Link } from "react-router-dom";

import { changeCurrentUser, selectUsers } from "../authSlice";
import { getTokensFromLocalStorage } from "../client/token";
import { parseToken } from "../token";
import { useAuth } from "../useAuth";
import { styles } from "render/ui/styles";

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
        <div style={{ ...styles.flex, ...styles.flexStart, ...styles.gap1 }}>
          <Tooltip text="个人中心" direction="n">
            <Link
              to="/life"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <button
                style={{
                  ...styles.clickable,
                  ...styles.transition,
                  ...styles.roundedFull,
                  padding: "8px", // 增加内边距以适应更大的图标
                  color: "inherit",
                  background: "none",
                  border: "none",
                }}
              >
                <PersonIcon size={36} /> {/* 将图标尺寸从 24 增加到 36 */}
              </button>
            </Link>
          </Tooltip>
          <span style={{ fontSize: "16px", fontWeight: "500" }}>
            {" "}
            {/* 增加字体大小 */}
            {auth.user?.username}
          </span>
        </div>
      }
      triggerType="hover"
    >
      <div
        style={{
          ...styles.flexColumn,
          ...styles.gap1,
          width: "160px",
          ...styles.p1,
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
                style={{
                  ...styles.clickable,
                  ...styles.transition,
                  ...styles.p1,
                  ...styles.rounded,
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  width: "100%",
                }}
              >
                {user.username}
              </button>
            ),
        )}
      </div>
    </DropDown>
  );
};
