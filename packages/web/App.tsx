import { useAuth } from "auth/useAuth";
import { parseToken } from "auth/token";
import i18n from "i18n";
import React, { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { restoreSession } from "auth/authSlice";

import { addHostToCurrentServer } from "setting/settingSlice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { FloatMenu } from "app/FloatMenu";
// // import { generatorRoutes } from "./generatorRoutes";

import { getTokensFromLocalStorage, removeToken } from "auth/client/token";
import { routes } from "./routes";

export default function App({ hostname, lng = "en" }) {
  // const routes = useMemo(() => generatorRoutes(hostname), [hostname]);
  // let element = useRoutes(routes);

  const dispatch = useAppDispatch();

  dispatch(addHostToCurrentServer(hostname));
  const auth = useAuth();
  i18n.changeLanguage(lng);
  useEffect(() => {
    const tokens = getTokensFromLocalStorage();
    if (tokens) {
      const parsedUsers = tokens.map((token) => parseToken(token));
      parsedUsers.length > 0 &&
        dispatch(
          restoreSession({
            user: parsedUsers[0],
            users: parsedUsers,
            token: tokens[0],
          }),
        );
    }
  }, []);

  const element = useRoutes(routes(auth.user));

  return (
    <>
      {element}
      <FloatMenu />
    </>
  );
}
