import { useAuth } from "auth/useAuth";
import { parseToken } from "auth/token";
import i18n from "i18n";
import React, { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { initAuth, restoreSession } from "auth/authSlice";

import { addHostToCurrentServer } from "setting/settingSlice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { FloatMenu } from "app/FloatMenu";
// // import { generatorRoutes } from "./generatorRoutes";

import { getTokensFromLocalStorage, removeToken } from "auth/client/token";
import { routes } from "./routes";
import { setTheme } from "app/theme/themeSlice";

export default function App({ hostname, lng = "en", theme = "light" }) {
  // const routes = useMemo(() => generatorRoutes(hostname), [hostname]);
  // let element = useRoutes(routes);

  const dispatch = useAppDispatch();

  dispatch(addHostToCurrentServer(hostname));
  dispatch(setTheme(theme));
  const auth = useAuth();
  i18n.changeLanguage(lng);

  useEffect(() => {
    const tokens = getTokensFromLocalStorage();
    if (tokens) {
      dispatch(initAuth(tokens));
    }
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

  const element = useRoutes(routes(auth.user));

  return (
    <>
      {element}
      <FloatMenu />
    </>
  );
}
