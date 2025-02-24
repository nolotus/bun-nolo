import React, { useEffect, useMemo } from "react";
import { useAppDispatch } from "app/hooks";
import { initializeAuth } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import i18n from "i18n";
import { Toaster } from "react-hot-toast";
import { useRoutes, Outlet } from "react-router-dom";
import { addHostToCurrentServer } from "setting/settingSlice";
import { setDarkMode } from "app/theme/themeSlice";
import { initializeSpace } from "create/space/spaceSlice";

import Article from "lab/s-station/Article";
import Collect from "lab/s-station/Collect";
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
          {
            path: "collect",
            element: <Collect />,
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
}

export default function App({
  hostname,
  lng = "en",
  isDark = false,
}: AppProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const appRoutes = useMemo(
    () => generatorRoutes(hostname, auth),
    [hostname, auth]
  );

  // 系统初始化
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // 1. 基础设置初始化
        dispatch(addHostToCurrentServer(hostname));
        dispatch(setDarkMode(isDark));

        // 2. 初始化认证
        const { user } = await dispatch(initializeAuth()).unwrap();

        await dispatch(initializeSpace(user.userId)).unwrap();
      } catch (error) {
        console.error("System initialization failed:", error);
      }
    };

    initializeSystem();
  }, [dispatch, hostname, isDark]);

  // 主题和语言初始化
  useEffect(() => {
    // 监听系统主题变化
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setDarkMode(event.matches);
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
  }, [lng]);

  // 渲染路由
  const element = useRoutes(appRoutes);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {element}
    </>
  );
}
