import React, { Suspense, lazy } from 'react';

const Create = lazy(() => import('./index'));
const CreateSurfingTrip = lazy(() => import('./pages/CreateSurfingTrip'));

const CreatePage = lazy(() => import('render/page/CreatePage'));
const CreateChatRobot = lazy(() => import('ai/pages/CreateChatRobot'));

export const createRoutes = [
  {
    path: 'create',
    element: (
      <Suspense fallback={<div>loading create</div>}>
        <Create />
      </Suspense>
    ),
  },
  {
    path: 'create/page',
    element: (
      <Suspense fallback={<div>CreatePage</div>}>
        <CreatePage />
      </Suspense>
    ),
  },
  {
    path: 'create/chat-robot',
    element: (
      <Suspense fallback={<div>chat-robot</div>}>
        <CreateChatRobot />
      </Suspense>
    ),
  },
  {
    path: 'create/surfing-trip',
    element: (
      <Suspense fallback={<div>surf-trip</div>}>
        <CreateSurfingTrip />
      </Suspense>
    ),
  },
];
