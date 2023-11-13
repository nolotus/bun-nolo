import { authRoutes } from 'auth/client/routes';
import { createRoutes } from 'create/routes';
import React, { Suspense, lazy } from 'react';
import Default from 'render/layout/Default';
import Full from 'render/layout/Full';
import Page from 'render/page/PageIndex';
import { routes as settingRoutes } from 'setting/routes';

import Home from './pages/Home';
import { SurfTip } from './SurfTip';

// const CreatePage = lazy(() => import('render/page/CreatePage'));
const ChatPage = lazy(() => import('chat/ChatPage'));
const Life = lazy(() => import('life/All'));
const Welcome = lazy(() => import('./pages/Welcome'));

export const routes = (currentUser) => [
  {
    path: '/',
    element: <Default />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      ...createRoutes,

      {
        path: 'welcome',
        element: (
          <Suspense fallback={<>...</>}>
            <Welcome />
          </Suspense>
        ),
      },
      {
        path: 'price',
        element: (
          <Page
            id={
              '000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-v9ziDvBB6UkWgFM_S2PV6'
            }
          />
        ),
      },

      ...authRoutes,
      {
        path: 'life',
        element: (
          <Suspense fallback={<div>loading life</div>}>
            <Life />
          </Suspense>
        ),
      },
    ],
  },
  ...settingRoutes,
  {
    path: '/',
    element: <Full />,
    children: [
      {
        path: 'chat',
        element: (
          <Suspense fallback={<div>loading chat</div>}>
            <ChatPage />
          </Suspense>
        ),
        children: [
          {
            path: ':chatId',
            element: (
              <Suspense fallback={<div>loading chat</div>}>
                <ChatPage />
              </Suspense>
            ),
          },
          { path: '*', element: <ChatPage /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<div>loading default</div>}>
        <Default />
      </Suspense>
    ),
    children: [{ path: 'surfing-safety-tips', element: <SurfTip /> }],
  },
  {
    path: ':pageId',
    element: (
      <Suspense fallback={<div>loading default</div>}>
        <Default />
      </Suspense>
    ),
    children: [{ index: true, element: <Page /> }],
  },
];
