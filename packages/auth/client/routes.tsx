import React from 'react';
import Login from 'user/pages/Login';
import Signup from 'user/pages/Signup';

export enum RoutePaths {
  LOGIN = '/login',
  REGISTER = '/register',
}
export const authRoutes = [
  { path: RoutePaths.LOGIN.slice(1), element: <Login /> },
  { path: RoutePaths.REGISTER.slice(1), element: <Signup /> },
];
