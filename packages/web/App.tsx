import React, { useEffect, useMemo } from "react";

import { useAppDispatch } from "app/hooks";
import { initAuth } from "auth/authSlice";
import { useAuth } from "auth/useAuth";
import i18n from "i18n";
import { Toaster } from "react-hot-toast";
import { useRoutes } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { addHostToCurrentServer } from "setting/settingSlice";

// // import { generatorRoutes } from "./generatorRoutes";

import { setDarkMode, setTheme } from "app/theme/themeSlice";
import { getTokensFromLocalStorage } from "auth/web/token";
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
export default function App({ hostname, lng = "en", isDark = false }) {
  const auth = useAuth();

  const routes = useMemo(
    () => generatorRoutes(hostname, auth),
    [hostname, auth],
  );

  // let element = useRoutes(routes);
  const dispatch = useAppDispatch();
  dispatch(addHostToCurrentServer(hostname));
  i18n.changeLanguage(lng);

  const init = async () => {
    // dispatch(setTheme(theme));
    setDarkMode(isDark);
    const tokens = getTokensFromLocalStorage();
    if (tokens) {
      await dispatch(initAuth(tokens));
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (event) => {
      if (event.matches) {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    };

    colorSchemeQuery.addEventListener("change", handleThemeChange);

    // Clean up the event listener when the component unmounts
    return () => {
      colorSchemeQuery.removeEventListener("change", handleThemeChange);
    };
  }, [dispatch]);

  const element = useRoutes(routes);

  return (
    <>
      <Toaster />
      {element}
    </>
  );
}
