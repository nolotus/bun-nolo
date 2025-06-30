// App.tsx (最终版本)

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
import GlobalThemeController from "app/theme/GlobalThemeController"; // <--- 1. 引入新的控制器

import Article from "lab/s-station/Article";
import NavbarComponent from "lab/s-station/Navbar";
import Moment from "lab/s-station/index";
import { commonRoutes } from "./generatorRoutes";
import { routes } from "./routes";

// 路由生成器函数 (保持不变)
const generatorRoutes = (hostname: string, auth: any) => {
  if (hostname === "nolotus.local" || hostname === "cybot.run") {
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
          ...commonRoutes,
        ],
      },
    ];
  }
  return routes(auth.user);
};

interface AppProps {
  hostname: string;
  lng?: string;
  tokenManager?: any;
}

export default function App({ hostname, lng = "en", tokenManager }: AppProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const initializedRef = useRef(false);

  useSystemTheme();

  const appRoutes = generatorRoutes(hostname, auth);

  // ... (所有 useEffect hooks 保持不变) ...

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const initializeSystem = async () => {
      try {
        dispatch(addHostToCurrentServer(hostname));
        await dispatch(initializeAuth(tokenManager)).unwrap();
      } catch (error) {
        console.error("系统初始化失败：", error);
      }
    };
    initializeSystem();
  }, [dispatch, hostname, tokenManager]);

  useEffect(() => {
    const initializeUserData = async () => {
      if (auth.user?.userId) {
        const userId = auth.user.userId;
        try {
          await dispatch(getSettings()).unwrap();
          await dispatch(fetchUserSpaceMemberships(userId)).unwrap();
          await dispatch(loadDefaultSpace()).unwrap();
        } catch (error) {
          console.error(`用户数据初始化失败 for ${userId}:`, error);
        }
      }
    };
    initializeUserData();
  }, [dispatch, auth.user]);

  useEffect(() => {
    if (lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng]);

  const element = useRoutes(appRoutes);

  return (
    <>
      {/* 2. 在顶层放置主题控制器。它不产生任何 div，只是在后台工作。 */}
      <GlobalThemeController />

      <Toaster position="top-right" reverseOrder={false} />
      {element}
    </>
  );
}
