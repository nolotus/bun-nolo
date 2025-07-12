// 文件路径: app/web/App.tsx

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
import Article from "lab/s-station/Article";
import NavbarComponent from "lab/s-station/Navbar";
import Moment from "lab/s-station/index";
import { commonRoutes } from "./generatorRoutes";
import { routes } from "./routes";

const selfrUrl = "selfr.nolo.chat";

const generatorRoutes = (hostname: string, auth: any) => {
  // ... (此函数保持不变)
  if (hostname === "nolotus.local" || hostname === selfrUrl) {
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
}

export default function App({ hostname, lng = "en" }: AppProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const initializedRef = useRef(false);

  useSystemTheme();
  const appRoutes = generatorRoutes(hostname, auth);
  const element = useRoutes(appRoutes);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const initializeSystem = async () => {
      try {
        dispatch(addHostToCurrentServer(hostname));
        // 【核心修改】调用 initializeAuth 时不再需要传递参数
        await dispatch(initializeAuth()).unwrap();
      } catch (error) {
        console.error("系统初始化失败：", error);
      }
    };
    initializeSystem();
  }, [dispatch, hostname]);

  useEffect(() => {
    // ... (此 useEffect 保持不变)
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
  }, [dispatch, auth.user]);

  useEffect(() => {
    // ... (此 useEffect 保持不变)
    if (lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng]);

  return (
    <>
      <GlobalThemeController />
      <Toaster position="top-right" reverseOrder={false} />
      {element}
    </>
  );
}
