import CreateChatRobot from 'ai/pages/CreateChatRobot';
import { useAppDispatch, useAuth } from 'app/hooks';
import { authRoutes } from 'auth/client/routes';
import { getTokensFromLocalStorage } from 'auth/client/token';
import { parseToken } from 'auth/token';
import ChatPage from 'chat/ChatPage';
import i18n from 'i18n';
import Life from 'life/All';
import React, { Suspense, lazy, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import {
  UserProfile,
  ExtendedProfile,
  SettingLayout,
  Network,
  Sync,
  PluginSettings,
  ImportSettings,
  ExportSettings,
  AccountSettings,
  ServiceProviderSettings,
} from 'setting';
import { restoreSession } from 'user/userSlice';
import Default from 'web/layout/Default';
import Full from 'web/layout/Full';

import Page from './Page';

// // import { generatorRoutes } from "./generatorRoutes";
// const ChatPage = lazy(() => import("chat/ChatPage"));
const Home = lazy(() => import('./pages/Home'));
const Welcome = lazy(() => import('./pages/Welcome'));

const routes = (currentUser) => [
  {
    path: '/',
    element: <Full />,
    children: [
      {
        path: 'settings',
        element: <SettingLayout />,
        children: [
          { path: 'user-profile', element: <UserProfile /> },
          { path: 'extended-profile', element: <ExtendedProfile /> },
          { path: 'plugins', element: <PluginSettings /> },
          { path: 'network', element: <Network /> },
          { path: 'sync', element: <Sync /> },
          { path: 'import', element: <ImportSettings /> },
          { path: 'export', element: <ExportSettings /> },
          { path: 'account', element: <AccountSettings /> },
          { path: 'service-provider', element: <ServiceProviderSettings /> },
        ],
      },
      {
        path: 'chat',
        element: <ChatPage />,
        children: [
          { path: ':chatId', element: <ChatPage /> },
          { path: '*', element: <ChatPage /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<div>loading layout</div>}>
        <Default />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>loading honme</div>}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'welcome',
        element: (
          <Suspense fallback={<>...</>}>
            <Welcome />
          </Suspense>
        ),
      },

      ...authRoutes,
      {
        path: 'life',
        element: <Life />,
      },
      {
        path: 'create/chatRobot',
        element: <CreateChatRobot />,
      },
    ],
  },
  {
    path: '/*',
    element: <Full />,
    children: [{ index: true, element: <Page /> }],
  },
];
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
