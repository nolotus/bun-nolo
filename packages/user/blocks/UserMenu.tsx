import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";
import { changeCurrentUser } from "user/userSlice";
import { Icon, LinkButton, DropDown } from "ui";
import { getTokensFromLocalStorage } from "auth/client/token";
import { parseToken } from "auth/token";
import { removeToken, retrieveFirstToken } from "auth/client/token";
import { userLogout } from "user/userSlice";

export const UserMenu = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const logout = () => {
    const token = retrieveFirstToken();
    removeToken(token);
    dispatch(userLogout());
  };
  const auth = useAuth();
  const users = useAppSelector((state) => state.user.users);

  const changeUser = (user) => {
    const tokens = getTokensFromLocalStorage();
    const updatedToken = tokens.find(
      (t) => parseToken(t).userId === user.userId
    );

    if (updatedToken) {
      const newTokens = [
        updatedToken,
        ...tokens.filter((t) => t !== updatedToken),
      ];
      window.localStorage.setItem("tokens", JSON.stringify(newTokens));
      dispatch(changeCurrentUser(user));
    }
  };
  console.log("UserMenu render ");
  return (
    <>
      <LinkButton
        to="/chat"
        icon="chat"
        label=""
        extraClass="rounded  flex items-center"
        iconClass="text-blue"
      />
      <LinkButton
        to="/create"
        icon="plus"
        label=""
        extraClass="rounded  flex items-center"
        iconClass="text-blue"
      />
      <LinkButton
        to="/life"
        icon="user"
        label={auth.user?.username}
        extraClass="flex justify-center items-center"
      />
      <DropDown
        trigger={
          <button className="flex items-center ml-2 focus:outline-none">
            <Icon name="chevronDown" className="w-8 h-8" />
          </button>
        }
      >
        <ul className="py-2">
          {users.map(
            (user) =>
              user !== auth.user && (
                <li key={user.userId}>
                  <button
                    onClick={() => changeUser(user)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    change to {user.username}
                  </button>
                </li>
              )
          )}
          <li>
            <button
              onClick={logout}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              {t("logout")}
            </button>
          </li>
          <li>
            <button
              onClick={() => {}}
              className="block w-full px-4 py-2 text-left hover:bg-gray-200"
            >
              <LinkButton to="/settings" icon="setting" label={t("settings")} />
            </button>
          </li>
        </ul>
      </DropDown>
    </>
  );
};
