import { authRoutes } from 'auth/client/routes';
import { routes as chatRoutes } from 'chat/routes';
import { createRoutes } from 'create/routes';
import { routes as lifeRoutes } from 'life/routes';
import React, { Suspense, lazy } from 'react';
import Default from 'render/layout/Default';
import Page from 'render/page/PageIndex';
import { routes as settingRoutes } from 'setting/routes';

import Home from './pages/Home';
import Spots from './pages/Spots';
import { SurfTip } from './SurfTip';

export const routes = (currentUser) => [
  {
    path: '/',
    element: <Default />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        index: true,
        path: 'spots',
        element: (
          <Suspense fallback={<div>loading spots</div>}>
            <Spots />
          </Suspense>
        ),
      },
      ...createRoutes,

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
    ],
  },
  settingRoutes,
  chatRoutes,
  {
    path: '/',
    element: (
      <Suspense fallback={<div>loading default</div>}>
        <Default />
      </Suspense>
    ),
    children: [{ path: 'surfing-safety-tips', element: <SurfTip /> }],
  },
  lifeRoutes,
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
