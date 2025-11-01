import React, { lazy, Suspense } from "react";

export enum RoutePaths {
  LOGIN = "/login",
  SIGNUP = "/signup",
  INVITE_SIGNUP = "/invite-signup",
  BETA_ACCESS_SIGNUP = "/beta-access-signup",
}

// 懒加载组件
const Login = lazy(() => import("auth/web/Login"));
const Signup = lazy(() => import("auth/web/Signup"));
const InviteSignup = lazy(() => import("auth/web/InviteSignup"));
const BetaAccessSignup = lazy(() => import("./BetaAccessSignup"));
const UsersPage = lazy(() => import("./UsersPage")); // 如未使用也已改为懒加载

// 可以自定义一个加载占位
const Fallback = <div>Loading...</div>;

export const authRoutes = [
  {
    path: RoutePaths.LOGIN.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: RoutePaths.SIGNUP.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: RoutePaths.INVITE_SIGNUP.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <InviteSignup />
      </Suspense>
    ),
  },
  {
    path: RoutePaths.BETA_ACCESS_SIGNUP.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <BetaAccessSignup />
      </Suspense>
    ),
  },
];
