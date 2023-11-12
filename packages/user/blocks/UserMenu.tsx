import {
  GearIcon,
  SignOutIcon,
  CommentIcon,
  PlusIcon,
  PersonIcon,
  ChevronDownIcon,
} from '@primer/octicons-react';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { getTokensFromLocalStorage, removeToken } from 'auth/client/token';
import { parseToken } from 'auth/token';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LinkButton, DropDown } from 'ui';
import { changeCurrentUser, userLogout } from 'user/userSlice';
export const UserMenu = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector((state) => state.user.currentToken);
  const logout = () => {
    removeToken(currentToken);
    dispatch(userLogout());
    navigate('/');
  };
  const auth = useAuth();
  const users = useAppSelector((state) => state.user.users);

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
      window.localStorage.setItem('tokens', JSON.stringify(newTokens));
      dispatch(changeCurrentUser({ user, token: updatedToken }));
    }
  };
  console.log('UserMenu render ');
  return (
    <>
      <LinkButton
        to="/chat"
        icon={<CommentIcon size={24} />}
        label=""
        extraClass="rounded flex items-center p-3 hover:bg-gray-100"
        iconClass="text-blue-500"
      />
      <LinkButton
        to="/create"
        icon={<PlusIcon size={24} />}
        label=""
        extraClass="rounded flex items-center p-3 hover:bg-gray-100"
        iconClass="text-green-500"
      />
      <LinkButton
        to="/life"
        icon={<PersonIcon size={24} />}
        label={auth.user?.username}
        extraClass="flex justify-center items-center p-3 hover:bg-gray-100"
        iconClass="text-purple-500"
      />
      <DropDown
        trigger={
          <button className="flex items-center ml-2 p-3 hover:bg-gray-100 focus:outline-none rounded-full">
            <ChevronDownIcon size={24} className="text-gray-700" />
          </button>
        }
      >
        <ul className="bg-white shadow-lg rounded-md py-1">
          {users.map(
            (user) =>
              user !== auth.user && (
                <li key={user.userId}>
                  <button
                    onClick={() => changeUser(user)}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {t('change_to')} {user.username}
                  </button>
                </li>
              ),
          )}
          <li>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-sm"
            >
              <SignOutIcon size={24} className="mr-3 text-gray-700" />
              {t('sign_out')}
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-sm"
            >
              <GearIcon size={24} className="mr-3 text-gray-700" />
              {t('settings')}
            </button>
          </li>
        </ul>
      </DropDown>
    </>
  );
};
