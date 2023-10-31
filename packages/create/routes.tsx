import React, { Suspense, lazy } from 'react';

const Create = lazy(() => import('.'));
const Layout = lazy(() => import('render/layout/Default'));
const UploadPage = lazy(() => import('./UploadPage'));
const CreatePage = lazy(() => import('./CreatePage'));
const CreateBlock = lazy(() => import('./pages/CreateBlock'));
const CreateNoMoadSpot = lazy(() => import('./pages/CreateNoMoadSpot'));
const CreateType = lazy(() => import('./pages/CreateType'));
const CreateArtcile = lazy(() => import('./pages/CreateArtcile'));
const CreateBooking = lazy(() => import('./pages/CreateBookings'));
const CreateChatRobot = lazy(() => import('ai/pages/CreateChatRobot'));

const createPages = [
  { path: 'page', component: CreatePage },
  { path: 'nomadspot', component: CreateNoMoadSpot },
  { path: 'block', component: CreateBlock },
  { path: 'type', component: CreateType },
  { path: 'artcile', component: CreateArtcile },
  { path: 'booking', component: CreateBooking },
  { path: 'chatrobot', component: CreateChatRobot }, // 新添加的页面
];

export const routesConfig = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: 'create', component: Create },
      ...createPages.map((page) => ({
        path: `create/${page.path}`,
        component: page.component,
      })),
      { path: 'upload', component: UploadPage },
    ],
  },
];

export const routes = routesConfig.map((route) => ({
  path: route.path,
  element: (
    <Suspense fallback={<>样式加载中</>}>
      <route.component />
    </Suspense>
  ),
  children: route.children?.map((childRoute) => ({
    path: childRoute.path,
    element: (
      <Suspense fallback={<>...</>}>
        <childRoute.component />
      </Suspense>
    ),
  })),
}));
