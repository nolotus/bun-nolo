import { useAppDispatch, useAuth } from 'app/hooks';
import { getTokensFromLocalStorage } from 'auth/client/token';
import { parseToken } from 'auth/token';
import i18n from 'i18n';
import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { restoreSession } from 'user/userSlice';

// // import { generatorRoutes } from "./generatorRoutes";
// const ChatPage = lazy(() => import("chat/ChatPage"));
import { routes } from './routes';
export default function App({ hostname, lng = 'en' }) {
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
        dispatch(restoreSession({ user: parsedUsers[0], users: parsedUsers }));
    }
  }, []);

  const element = useRoutes(routes(auth.user));
  return element;
}
