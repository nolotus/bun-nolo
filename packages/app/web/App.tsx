// app/web/App.tsx
import React, { useEffect, useRef, useMemo } from "react";
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
    if (lng) i18n.changeLanguage(lng);
    if (hostname === dateUrl) return;

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
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--backgroundGhost)",
            color: "var(--text)",
            border: "0.5px solid var(--border)", // ✅ 0.5px
            boxShadow: "0 12px 30px var(--shadowMedium)",
            backdropFilter: "blur(12px) saturate(140%)",
            WebkitBackdropFilter: "blur(12px) saturate(140%)",
            borderRadius: 14,
            padding: "var(--space-3) var(--space-4)",
          },
        }}
      />
      {element}
    </>
  );
}
