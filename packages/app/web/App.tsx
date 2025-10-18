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
  initialRoutes: RouteObject[]; // 明确要求由外部传入，App 只负责渲染与初始化，提升可维护性
}

export default function App({ hostname, lng = "en", initialRoutes }: AppProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const initializedRef = useRef(false);

  useSystemTheme();

  // 路由交由服务端/入口统一解析，这里只消费
  const element = useRoutes(initialRoutes);

  // 系统初始化（date 站点跳过）
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (hostname === dateUrl) {
      console.log("【Demo模式】跳过后端初始化");
      return;
    }

    (async () => {
      try {
        dispatch(addHostToCurrentServer(hostname));
        await dispatch(initializeAuth()).unwrap();
      } catch (error) {
        console.error("系统初始化失败：", error);
      }
    })();
  }, [dispatch, hostname]);

  // 用户数据初始化（date 站点跳过）
  useEffect(() => {
    if (hostname === dateUrl) return;

    (async () => {
      const userId = auth.user?.userId;
      if (!userId) return;
      try {
        await dispatch(getSettings()).unwrap();
        await dispatch(fetchUserSpaceMemberships(userId)).unwrap();
        await dispatch(loadDefaultSpace(userId)).unwrap();
      } catch (error) {
        console.error(`用户数据初始化失败 for ${userId}:`, error);
      }
    })();
  }, [dispatch, auth.user, hostname]);

  // i18n
  useEffect(() => {
    if (lng) i18n.changeLanguage(lng);
  }, [lng]);

  return (
    <>
      <GlobalThemeController />
      <Toaster position="top-right" reverseOrder={false} />
      {element}
    </>
  );
}
