import React, { useEffect, useMemo } from "react";

import { useAppDispatch } from "app/hooks";
import { initializeAuth } from "auth/authSlice";
import { useAuth } from "auth/hooks/useAuth";
import i18n from "i18n";
import { Toaster } from "react-hot-toast";
import { useRoutes } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { addHostToCurrentServer } from "setting/settingSlice";

// // import { generatorRoutes } from "./generatorRoutes";

import { setDarkMode, setTheme } from "app/theme/themeSlice";
import Article from "lab/s-station/Article";
import Collect from "lab/s-station/Collect";
import NavbarComponent from "lab/s-station/Navbar";
import Moment from "lab/s-station/index";
import { commonRoutes } from "./generatorRoutes";
import { routes } from "./routes";

const generatorRoutes = (hostname, auth) => {
  if (hostname === "nolotus.local" || hostname === "cybot.me") {
    const localRoutes = [
      {
        path: "/",
        element: (
          <div>
            <NavbarComponent />
            <Outlet />;
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
    return localRoutes;
  }
  if (hostname === "cybot.one" || hostname === "cybot.run") {
    return routes(auth.user);
  }
  return routes(auth.user);
};
// App.tsx
export default function App({ hostname, lng = "en", isDark = false }) {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const routes = useMemo(
    () => generatorRoutes(hostname, auth),
    [hostname, auth]
  );

  useEffect(() => {
    // 初始化
    const init = async () => {
      dispatch(addHostToCurrentServer(hostname));
      setDarkMode(isDark);
      await dispatch(initializeAuth());
    };

    init();

    // 监听系统主题变化
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (event) => {
      setDarkMode(event.matches);
    };

    colorSchemeQuery.addEventListener("change", handleThemeChange);
    i18n.changeLanguage(lng);

    return () => {
      colorSchemeQuery.removeEventListener("change", handleThemeChange);
    };
  }, [dispatch, hostname, lng, isDark]);

  const element = useRoutes(routes);

  return (
    <>
      <Toaster />
      {element}
    </>
  );
}
