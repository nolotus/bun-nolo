// app/web/App.tsx
import React, { useEffect, useRef } from "react";
import type { RouteObject } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAppDispatch } from "app/store";
import { initializeAuth } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import i18n from "app/i18n";
import { addHostToCurrentServer, getSettings } from "app/settings/settingSlice";
import {
  fetchUserSpaceMemberships,
  loadDefaultSpace,
} from "create/space/spaceSlice";
import { useSystemTheme } from "app/theme/useSystemTheme";
import GlobalThemeController from "app/theme/GlobalThemeController";

const dateUrl = "date.nolo.chat";

interface AppProps {
  hostname: string;
  lng?: string;
  initialRoutes: RouteObject[];
}

export default function App({ hostname, lng = "en", initialRoutes }: AppProps) {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const initializedRef = useRef(false);

  useSystemTheme();
  const element = useRoutes(initialRoutes);

  useEffect(() => {
    // i18n：语言变化即更新
    if (lng) i18n.changeLanguage(lng);

    // Demo 站点跳过后端初始化与用户数据
    if (hostname === dateUrl) return;

    // 一次性系统初始化（只运行一次）
    if (!initializedRef.current) {
      initializedRef.current = true;
      (async () => {
        try {
          dispatch(addHostToCurrentServer(hostname));
          await dispatch(initializeAuth()).unwrap();
        } catch (e) {
          console.error("系统初始化失败:", e);
        }
      })();
    }

    // 用户数据（依赖登录态）
    const userId = auth.user?.userId;
    if (!userId) return;
    (async () => {
      try {
        await dispatch(getSettings()).unwrap();
        await dispatch(fetchUserSpaceMemberships(userId)).unwrap();
        await dispatch(loadDefaultSpace(userId)).unwrap();
      } catch (e) {
        console.error(`用户数据初始化失败 for ${userId}:`, e);
      }
    })();
  }, [dispatch, hostname, lng, auth.user?.userId]);

  return (
    <>
      <GlobalThemeController />
      <Toaster position="top-right" />
      {element}
    </>
  );
}
