import { useAppSelector } from 'app/hooks';
import { RoutePaths } from 'auth/client/routes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { UserMenu } from './UserMenu';

const AuthLinks = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      <Link
        to={RoutePaths.LOGIN}
        className="mr-4 text-blue-600 hover:text-blue-800"
      >
        {t('login')}
      </Link>
      <Link
        to={RoutePaths.REGISTER}
        className="py-1 px-2 border border-green-400 rounded text-green-600 hover:bg-green-100 hover:text-green-800"
      >
        {t('signup')}
      </Link>
    </div>
  );
};

export const GoUser = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  return (
    <div className="flex items-center">
      {isLoggedIn ? <UserMenu /> : <AuthLinks />}
    </div>
  );
};
