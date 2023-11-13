import { useAppSelector } from 'app/hooks';
import { RoutePaths } from 'auth/client/routes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'ui';

import { UserMenu } from './UserMenu';
const AuthLinks = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      <Link to={RoutePaths.LOGIN} className="mr-4 font-semibold text-zinc-900">
        {t('login')}
      </Link>
      <Link
        to={RoutePaths.REGISTER}
        className="text-emerald-500 underline decoration-double font-semibold p-2 hover:text-emerald-700 "
      >
        {t('signup')}
      </Link>
    </div>
  );
};

export const UserControls = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  return (
    <div className="flex items-center">
      {isLoggedIn ? <UserMenu /> : <AuthLinks />}
    </div>
  );
};
