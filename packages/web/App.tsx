// App.tsx

import React, { useEffect, useMemo, useRef } from "react";
import { useAppDispatch } from "app/hooks";
import { initializeAuth, selectCurrentUserId } from "auth/authSlice"; // 假设 selectCurrentUserId 在这里
import { useAuth } from "auth/hooks/useAuth";
import i18n from "i18n";
import { Toaster } from "react-hot-toast";
import { useRoutes, Outlet } from "react-router-dom";
import { addHostToCurrentServer, getSettings } from "setting/settingSlice";
import { setDarkMode } from "app/theme/themeSlice";
// 导入 fetchUserSpaceMemberships 和 loadDefaultSpace
import {
  fetchUserSpaceMemberships,
  loadDefaultSpace,
} from "create/space/spaceSlice";

import Article from "lab/s-station/Article";
import NavbarComponent from "lab/s-station/Navbar";
import Moment from "lab/s-station/index";
import { commonRoutes } from "./generatorRoutes";
import { routes } from "./routes";

// 路由生成器函数 (保持不变)
const generatorRoutes = (hostname: string, auth: any) => {
  // ... (代码保持不变)
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

  // 系统初始化 (保持不变)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const initializeSystem = async () => {
      try {
        console.log("hostname", hostname);
        dispatch(addHostToCurrentServer(hostname));
        dispatch(setDarkMode(isDark));
        await dispatch(initializeAuth(tokenManager)).unwrap();
      } catch (error) {
        console.error("系统初始化失败：", error);
      }
    };
    initializeSystem();
  }, [dispatch, hostname, isDark, tokenManager]);

  // 用户相关的初始化（修改此部分）
  useEffect(() => {
    const initializeUserData = async () => {
      // 确保 auth.user 和 userId 都存在
      if (auth.user?.userId) {
        const userId = auth.user.userId;
        try {
          // 1. 获取用户设置 (包含默认 Space ID 偏好)
          await dispatch(getSettings(userId)).unwrap();

          // 2. 获取用户的所有 Space 成员列表
          // 这会填充 state.space.memberSpaces，供 SidebarTop 和 loadDefaultSpace 使用
          await dispatch(fetchUserSpaceMemberships(userId)).unwrap();

          // 3. 尝试加载默认 Space
          // 这个 action 现在会利用已获取的列表和设置，
          // 并且如果 PageLoader 已加载了 Space，它会跳过
          await dispatch(loadDefaultSpace(userId)).unwrap();
        } catch (error) {
          // 更具体地记录错误
          console.error(`用户数据初始化失败 for ${userId}:`, error);
        }
      }
    };

    initializeUserData();
  }, [dispatch, auth.user]); // 监听 auth.user 变化 (保持不变)

  // 主题和语言初始化 (保持不变)
  useEffect(() => {
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (event: MediaQueryListEvent) => {
      dispatch(setDarkMode(event.matches));
    };
    colorSchemeQuery.addEventListener("change", handleThemeChange);
    if (lng) {
      i18n.changeLanguage(lng);
    }
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
