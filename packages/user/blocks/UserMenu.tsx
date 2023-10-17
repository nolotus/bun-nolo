import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import { Icon, LinkButton, DropDown } from "ui";
import { UserContext } from "../UserContext";

export const UserMenu = () => {
  const { t } = useTranslation();
  const { logout, currentUser, users, updateCurrentUser } =
    useContext(UserContext);
  console.log("users", users);
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
        label={currentUser?.username}
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
              user !== currentUser && (
                <li key={user.userId}>
                  <button
                    onClick={() => updateCurrentUser(user)}
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
