import React, { useEffect, useMemo, useRef } from "react";
import { useAppDispatch } from "app/hooks";
import { initializeAuth } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import i18n from "i18n";
import { Toaster } from "react-hot-toast";
import { useRoutes, Outlet } from "react-router-dom";
import { addHostToCurrentServer, getSettings } from "setting/settingSlice";
import { setDarkMode } from "app/theme/themeSlice";
import { initializeSpace } from "create/space/spaceSlice";

import Article from "lab/s-station/Article";
import NavbarComponent from "lab/s-station/Navbar";
import Moment from "lab/s-station/index";
import { commonRoutes } from "./generatorRoutes";
import { routes } from "./routes";

// 路由生成器函数
const generatorRoutes = (hostname: string, auth: any) => {
  if (hostname === "nolotus.local" || hostname === "cybot.me") {
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
          {
            index: true,
            element: <Moment />,
          },
          {
            path: "article",
            element: <Article />,
          },

          ...commonRoutes,
        ],
      },
    ];
  }

  if (hostname === "cybot.one" || hostname === "cybot.run") {
    return routes(auth.user);
  }

  return routes(auth.user);
};

interface AppProps {
  hostname: string;
  lng?: string;
  isDark?: boolean;
  tokenManager?: any;
}

export default function App({
  hostname,
  lng = "en",
  isDark = false,
  tokenManager,
}: AppProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  // 使用 useRef 来标记是否已初始化，防止因 StrictMode 重复调用
  const initializedRef = useRef(false);

  const appRoutes = useMemo(
    () => generatorRoutes(hostname, auth),
    [hostname, auth]
  );

  // 系统初始化
  useEffect(() => {
    // 如果已经初始化，则直接返回
    if (initializedRef.current) return;
    initializedRef.current = true;
    console.log("App init");
    const initializeSystem = async () => {
      try {
        // 1. 基础设置初始化
        dispatch(addHostToCurrentServer(hostname));
        dispatch(setDarkMode(isDark));

        // 2. 初始化认证
        await dispatch(initializeAuth(tokenManager)).unwrap();
      } catch (error) {
        console.error("系统初始化失败：", error);
      }
    };

    initializeSystem();
  }, [dispatch, hostname, isDark, tokenManager]);

  // 用户相关的初始化（支持切换用户）
  useEffect(() => {
    const initializeUserData = async () => {
      if (auth.user?.userId) {
        try {
          await dispatch(getSettings(auth.user.userId)).unwrap();
          await dispatch(initializeSpace(auth.user.userId)).unwrap();
        } catch (error) {
          console.error("用户数据初始化失败：", error);
        }
      }
    };

    initializeUserData();
  }, [dispatch, auth.user]); // 监听 auth.user 变化

  // 主题和语言初始化
  useEffect(() => {
    // 监听系统主题变化
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (event: MediaQueryListEvent) => {
      dispatch(setDarkMode(event.matches));
    };

    colorSchemeQuery.addEventListener("change", handleThemeChange);

    // 设置语言
    if (lng) {
      i18n.changeLanguage(lng);
    }

    // 清理函数
    return () => {
      colorSchemeQuery.removeEventListener("change", handleThemeChange);
    };
  }, [dispatch, lng]);

  // 渲染路由
  const element = useRoutes(appRoutes);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {element}
    </>
  );
}
