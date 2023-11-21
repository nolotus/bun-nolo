import {
  fetchBaseQuery,
  buildCreateApi,
  coreModule,
  reactHooksModule,
} from '@reduxjs/toolkit/query/react';
import { isProduction } from 'utils/env';

const baseUrl = isProduction ? '/' : 'http://localhost';

const createApi = buildCreateApi(
  coreModule(),
  reactHooksModule({ unstable__sideEffectsInRender: true }),
);

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = getState().user.currentToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    responseHandler: async (response) => {
      if (response.headers.get('Content-Type')?.includes('audio')) {
        // Instead of returning the Blob directly, create an Object URL here and return that instead.
        const blob = new Blob([await response.arrayBuffer()], {
          type: 'audio/mpeg',
        });
        return URL.createObjectURL(blob);
      }
      // Default to JSON handling
      return response.json();
    },
  }),
  endpoints: () => ({}),
});
