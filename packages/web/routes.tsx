import { authRoutes } from 'auth/client/routes';
import { routes as createRoutes } from 'create/routes';
import React, { Suspense, lazy } from 'react';
import Default from 'render/layout/Default';
import { routes as settingRoutes } from 'setting/routes';

import { SurfTip } from './SurfTip';

const ChatPage = lazy(() => import('chat/ChatPage'));
const Home = lazy(() => import('./pages/Home'));
const Life = lazy(() => import('life/All'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Full = lazy(() => import('render/layout/Full'));
const Page = lazy(() => import('render/Page'));

export const routes = (currentUser) => [
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
          <Suspense fallback={<div>loading home</div>}>
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
      {
        path: 'price',
        element: (
          <Suspense fallback={<>...</>}>
            <Page
              id={
                '000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-v9ziDvBB6UkWgFM_S2PV6'
              }
            />
          </Suspense>
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
  ...createRoutes,
  {
    path: '/',
    element: (
      <Suspense fallback={<div>loading full</div>}>
        <Full />
      </Suspense>
    ),
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
