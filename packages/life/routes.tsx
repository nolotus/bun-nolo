import React, { Suspense, lazy } from 'react';

const All = lazy(() => import('life/pages/All'));
const Statistics = lazy(() => import('life/pages/Statistics'));
const Notes = lazy(() => import('life/pages/Notes'));
const Welcome = lazy(() => import('web/pages/Welcome'));

import { Layout } from './Layout';

export const routes = {
  path: '/',
  element: <Layout />,
  children: [
    {
      path: 'life',
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<div>loading Welcome</div>}>
              <Welcome />
            </Suspense>
          ),
        },
        {
          index: true,
          path: 'all',
          element: (
            <Suspense fallback={<div>loading all</div>}>
              <All />
            </Suspense>
          ),
        },
        {
          path: 'statistics',
          element: (
            <Suspense fallback={<div>loading statistics</div>}>
              <Statistics />
            </Suspense>
          ),
        },
        {
          path: 'notes',
          element: (
            <Suspense fallback={<div>loading notes</div>}>
              <Notes />
            </Suspense>
          ),
        },
      ],
    },
  ],
};
