import { useAuth } from "auth/useAuth";
import { getTokensFromLocalStorage } from "auth/client/token";
import { parseToken } from "auth/token";
import i18n from "i18n";
import React, { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { restoreSession } from "auth/authSlice";

// // import { generatorRoutes } from "./generatorRoutes";

import { routes } from "./routes";
import { addHostToCurrentServer } from "setting/settingSlice";
import { useAppDispatch } from "app/hooks";
export default function App({ hostname, lng = "en" }) {
  // const routes = useMemo(() => generatorRoutes(hostname), [hostname]);
  // let element = useRoutes(routes);

  const auth = useAuth();
  i18n.changeLanguage(lng);
  const dispatch = useAppDispatch();
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
  useEffect(() => {
    dispatch(addHostToCurrentServer(hostname));
  }, []);

  const element = useRoutes(routes(auth.user));
  return element;
}
