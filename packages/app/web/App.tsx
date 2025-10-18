// src/app/App.tsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { useRoutes, Outlet } from "react-router-dom";
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

/* -------------------------- 域名常量 -------------------------- */
const selfrUrl = "selfr.nolo.chat";
const dateUrl = "date.nolo.chat";

/* -------------------------- 按域名动态装配路由 -------------------------- */
function useHostRoutes(hostname: string, auth: any) {
  const [routes, setRoutes] = useState<RouteObject[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) date 站点（含本地开发域名）
      if (hostname === "nolotus.local" || hostname === dateUrl) {
        const mod = await import("lab/date/dateRoutes");
        if (!cancelled) setRoutes(mod.dateRoutes);
        return;
      }

      // 2) selfr 站点（S-Station）
      if (hostname === selfrUrl) {
        const [
          { default: NavbarComponent },
          { default: Moment },
          { default: Article },
          modRoutes,
        ] = await Promise.all([
          import("lab/s-station/Navbar"),
          import("lab/s-station/index"),
          import("lab/s-station/Article"),
          import("./routes"),
        ]);

        const built: RouteObject[] = [
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
              ...modRoutes.routes(auth.user),
            ],
          },
        ];
        if (!cancelled) setRoutes(built);
        return;
      }

      // 3) 其它未知域名：只加载通用 routes
      const modRoutes = await import("./routes");
      if (!cancelled) setRoutes(modRoutes.routes(auth.user));
    }

    setRoutes(null); // 切换 hostname 或 auth.user 时重置
    load();

    return () => {
      cancelled = true;
    };
  }, [hostname, auth.user]);

  return routes;
}

/* -------------------------- App 主组件 -------------------------- */
interface AppProps {
  hostname: string;
  lng?: string;
}

export default function App({ hostname, lng = "en" }: AppProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const initializedRef = useRef(false);

  // 系统主题（跟随系统）
  useSystemTheme();

  // 动态生成并渲染当前域名需要的路由
  const hostRoutes = useHostRoutes(hostname, auth);
  const element = hostRoutes ? useRoutes(hostRoutes) : null;

  /* -------------------- 系统初始化（date 站点跳过） -------------------- */
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

  /* -------------------- 用户数据初始化（date 站点跳过） -------------------- */
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

  /* -------------------- i18n 语言切换 -------------------- */
  useEffect(() => {
    if (lng) i18n.changeLanguage(lng);
  }, [lng]);

  /* -------------------- 渲染 -------------------- */
  return (
    <>
      <GlobalThemeController />
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        {element}
      </Suspense>
    </>
  );
}
