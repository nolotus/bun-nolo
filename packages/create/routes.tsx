import React, { Suspense, lazy } from 'react';

const Create = lazy(() => import('.'));
const Layout = lazy(() => import('render/layout/Default'));
const UploadPage = lazy(() => import('./UploadPage'));
const CreatePage = lazy(() => import('render/page/CreatePage'));
const CreateSurfingTrip = lazy(() => import('./pages/CreateSurfingTrip'));
const CreateSurferProfile = lazy(() => import('./pages/CreateSurferProfile'));

const CreateChatRobot = lazy(() => import('ai/pages/CreateChatRobot'));

const createPages = [
  { path: 'page', component: CreatePage },
  { path: 'chatrobot', component: CreateChatRobot },
  { path: 'surfing-trip', component: CreateSurfingTrip },
  { path: 'surfer-profile', component: CreateSurferProfile },
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
