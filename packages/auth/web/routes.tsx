// 文件路径: (你原来的路由配置文件)

import React, { lazy, Suspense } from "react";
import { AppRoutePaths } from "app/constants/routePaths"; // 1. 从新文件导入

// 2. 旧的 RoutePaths enum 定义已被移除

// 懒加载组件
const Login = lazy(() => import("auth/web/Login"));
const Signup = lazy(() => import("auth/web/Signup"));
const InviteSignup = lazy(() => import("auth/web/InviteSignup"));
const BetaAccessSignup = lazy(() => import("./BetaAccessSignup"));
const UsersPage = lazy(() => import("./UsersPage"));

// 可以自定义一个加载占位
const Fallback = <div>Loading...</div>;

export const authRoutes = [
  {
    // 3. 使用新的 AppRoutePaths
    path: AppRoutePaths.LOGIN.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: AppRoutePaths.SIGNUP.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: AppRoutePaths.INVITE_SIGNUP.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <InviteSignup />
      </Suspense>
    ),
  },
  {
    path: AppRoutePaths.BETA_ACCESS_SIGNUP.slice(1),
    element: (
      <Suspense fallback={Fallback}>
        <BetaAccessSignup />
      </Suspense>
    ),
  },
];
