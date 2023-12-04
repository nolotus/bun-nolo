'use client';
import {
  GearIcon,
  SignOutIcon,
  CommentIcon,
  PlusIcon,
  PersonIcon,
  ChevronDownIcon,
  NoteIcon,
  DependabotIcon,
} from '@primer/octicons-react';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { changeCurrentUser, userLogout } from 'auth/authSlice';
import { getTokensFromLocalStorage, removeToken } from 'auth/client/token';
import { parseToken } from 'auth/token';
import { CreateRoutePaths } from 'create/routes';
import { LifeRoutePaths } from 'life/routes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { LinkButton, DropDown } from 'ui';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector((state) => state.auth.currentToken);
  const logout = () => {
    removeToken(currentToken);
    dispatch(userLogout());
    navigate('/');
  };
  const auth = useAuth();
  const users = useAppSelector((state) => state.auth.users);

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
  return (
    <>
      <LinkButton
        to="/chat"
        icon={<CommentIcon size={24} />}
        label=""
        className="flex items-center p-3 hover:bg-sky-500 hover:text-white"
      />
      <DropDown
        trigger={
          <LinkButton
            to="/create"
            icon={<PlusIcon size={24} />}
            label={t('create')}
            className="flex justify-center items-center p-3 hover:bg-sky-500 hover:text-white"
          />
        }
        triggerType="hover"
      >
        <ul className="bg-white    py-1">
          <li>
            <NavLink
              to={`${CreateRoutePaths.CREATE_PAGE}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 ease-in-out"
            >
              <NoteIcon size={20} className="mr-2" />
              <span>创建空白页面</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${CreateRoutePaths.CREATE_CHAT_ROBOT}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 ease-in-out"
            >
              <DependabotIcon size={20} className="mr-2" />
              <span>创建智能助理</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${CreateRoutePaths.CREATE_CHAT_ROBOT}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 ease-in-out"
            >
              <DependabotIcon size={20} className="mr-2" />
              <span>创建浪点</span>
            </NavLink>
          </li>
        </ul>
      </DropDown>

      <DropDown
        trigger={
          <LinkButton
            to={`/${LifeRoutePaths.WELCOME}`}
            icon={<PersonIcon size={24} />}
            label={auth.user?.username}
            className="flex justify-center items-center p-3 hover:bg-sky-500 hover:text-white"
          />
        }
        triggerType="hover" // 设置触发类型为 hover
      >
        <ul className="bg-white shadow-lg rounded-md py-1">
          <li>
            <NavLink
              to="/life/notes"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              <NoteIcon size={20} />
              <span>Notes</span>
            </NavLink>
          </li>
          <li>
            <a href="#b" className="block px-4 py-2 text-sm hover:bg-gray-100">
              Option B
            </a>
          </li>
          <li>
            <a href="#c" className="block px-4 py-2 text-sm hover:bg-gray-100">
              Option C
            </a>
          </li>
        </ul>
      </DropDown>

      <DropDown
        triggerType="hover"
        trigger={
          <button className="flex items-center ml-2 p-3 hover:bg-sky-500 focus:outline-none rounded-full hover:text-white">
            <ChevronDownIcon size={24} className="text-ne" />
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
