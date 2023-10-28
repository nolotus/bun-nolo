import CreateChatRobot from 'ai/pages/CreateChatRobot';
import { useAppDispatch, useAuth } from 'app/hooks';
import { getTokensFromLocalStorage } from 'auth/client/token';
import { parseToken } from 'auth/token';
import ChatPage from 'chat/ChatPage';
import { resources } from 'i18n';
import { use } from 'i18next';
import Life from 'life/All';
import React, { Suspense, lazy, useEffect } from 'react';
import { initReactI18next } from 'react-i18next';
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
import Login from 'user/pages/Login';
import Signup from 'user/pages/Signup';
import { restoreSession } from 'user/userSlice';
import Default from 'web/layout/Default';
import Full from 'web/layout/Full';

import Page from './Page';

// // import { generatorRoutes } from "./generatorRoutes";
// const ChatPage = lazy(() => import("chat/ChatPage"));
const Home = lazy(() => import('./pages/Home'));

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
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
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
  console.log('auth.user', auth.user);
  use(initReactI18next).init({
    lng,
    fallbackLng: {
      'zh-TW': ['zh-Hant'],
      'zh-HK': ['zh-Hant'],
      'zh-MO': ['zh-Hant'],
      default: ['en'],
    },
    interpolation: {
      escapeValue: false,
    },
    resources,
  });
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
