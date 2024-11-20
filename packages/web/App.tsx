import React, { useEffect, useMemo } from "react";

import { useAuth } from "auth/useAuth";
import i18n from "i18n";
import { useRoutes } from "react-router-dom";
import { initAuth } from "auth/authSlice";
import { Toaster } from "react-hot-toast";
import { addHostToCurrentServer } from "setting/settingSlice";
import { useAppDispatch } from "app/hooks";
import { Outlet } from "react-router-dom";

// // import { generatorRoutes } from "./generatorRoutes";

import { getTokensFromLocalStorage } from "auth/client/token";
import { routes } from "./routes";
import { setTheme } from "app/theme/themeSlice";
import PageOne from "lab/s-station/index";
const generatorRoutes = (hostname, auth) => {
  if (hostname === "nolotus.local" || hostname === "cybot.me") {
    const localRoutes = [
      {
        path: "/",
        element: (
          <div>
            <Outlet />;
          </div>
        ),
        children: [
          {
            index: true,
            element: <PageOne />,
          },
        ],
      },
    ];
    return localRoutes;
  }
  if (hostname === "cybot.one" || hostname === "cybot.run") {
    return routes(auth.user);
  } else {
    return routes(auth.user);
  }
};
export default function App({ hostname, lng = "en", theme = "light" }) {
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
    dispatch(setTheme(theme));
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
        dispatch(setTheme("dark"));
      } else {
        dispatch(setTheme("light"));
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
