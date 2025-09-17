// src/app/App.tsx
import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "app/store";
import { initializeAuth } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import i18n from "app/i18n";
import { Toaster } from "react-hot-toast";
import { useRoutes, Outlet } from "react-router-dom";
import { addHostToCurrentServer, getSettings } from "app/settings/settingSlice";
import {
  fetchUserSpaceMemberships,
  loadDefaultSpace,
} from "create/space/spaceSlice";
import { useSystemTheme } from "app/theme/useSystemTheme";
import GlobalThemeController from "app/theme/GlobalThemeController";

// S-Station 页面（非 Dating）
import Article from "lab/s-station/Article";
import NavbarComponent from "lab/s-station/Navbar";
import Moment from "lab/s-station/index";

// Dating 站点导入入口（所有 Dating 路由统一从这里导入）
import { dateRoutes } from "lab/date/dateRoutes"; // 👈 这是我们新抽离的路由配置

import { routes } from "./routes";

/* -------------------------- 域名常量 -------------------------- */
const selfrUrl = "selfr.nolo.chat";
const dateUrl = "date.nolo.chat";

/* -------------------------- 路由生成函数 -------------------------- */
const generatorRoutes = (hostname: string, auth: any) => {
  /**
   * 1️⃣ date.nolo.chat 站点 (约会站点)
   * - 使用模块化路由配置导入
   */
  if (hostname === "nolotus.local" || hostname === dateUrl) {
    return dateRoutes; // 👈 直接使用我们抽离的路由配置
  }

  /**
   * 2️⃣ selfr.nolo.chat 站点 (S-Station)
   */
  if (hostname === selfrUrl) {
    return [
      {
        path: "/",
        element: (
          <div>
            <NavbarComponent />
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <Moment /> },
          { path: "article", element: <Article /> },
          ...routes(auth.user),
        ],
      },
    ];
  }

  /**
   * 3️⃣ 其它未知 hostname
   */
  return routes(auth.user);
};

/* -------------------------- App 主组件 -------------------------- */
interface AppProps {
  hostname: string;
  lng?: string;
}

export default function App({ hostname, lng = "en" }: AppProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const initializedRef = useRef(false);

  // 系统主题
  useSystemTheme();

  // 生成路由
  const appRoutes = generatorRoutes(hostname, auth);
  const element = useRoutes(appRoutes);

  /* -------------------- 系统初始化 (优化版) -------------------- */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 【重点优化】date 站点不执行任何后端初始化
    if (hostname === dateUrl) {
      console.log("【Demo模式】跳过后端初始化");
      return;
    }

    const initializeSystem = async () => {
      try {
        dispatch(addHostToCurrentServer(hostname));
        await dispatch(initializeAuth()).unwrap();
      } catch (error) {
        console.error("系统初始化失败：", error);
      }
    };
    initializeSystem();
  }, [dispatch, hostname]);

  /* -------------------- 用户数据初始化 (优化版) -------------------- */
  useEffect(() => {
    // 【优化】date 站点不加载用户数据
    if (hostname === dateUrl) return;

    const initializeUserData = async () => {
      if (auth.user?.userId) {
        const userId = auth.user.userId;
        try {
          await dispatch(getSettings()).unwrap();
          await dispatch(fetchUserSpaceMemberships(userId)).unwrap();
          await dispatch(loadDefaultSpace(userId)).unwrap();
        } catch (error) {
          console.error(`用户数据初始化失败 for ${userId}:`, error);
        }
      }
    };
    initializeUserData();
  }, [dispatch, auth.user, hostname]);

  /* -------------------- i18n 语言切换 -------------------- */
  useEffect(() => {
    if (lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng]);

  /* -------------------- 渲染 -------------------- */
  return (
    <>
      <GlobalThemeController />
      <Toaster position="top-right" reverseOrder={false} />
      {element}
    </>
  );
}
