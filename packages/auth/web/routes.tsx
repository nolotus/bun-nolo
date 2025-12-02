import { AppRoutePaths } from "app/constants/routePaths";
import Signup from "auth/web/Signup";
import PageLoading from "render/web/ui/PageLoading";
import React, { Suspense, lazy } from "react";

const Login = lazy(() => import("auth/web/Login"));
const InviteSignup = lazy(() => import("auth/web/InviteSignup"));
const BetaAccessSignup = lazy(() => import("./BetaAccessSignup"));

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoading minHeight="100vh" />}>
    <Component />
  </Suspense>
);

export const authRoutes = [
  { path: AppRoutePaths.LOGIN.slice(1), element: withSuspense(Login) },
  { path: AppRoutePaths.SIGNUP.slice(1), element: <Signup /> },
  {
    path: AppRoutePaths.INVITE_SIGNUP.slice(1),
    element: withSuspense(InviteSignup),
  },
  {
    path: AppRoutePaths.BETA_ACCESS_SIGNUP.slice(1),
    element: withSuspense(BetaAccessSignup),
  },
];
