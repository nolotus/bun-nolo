import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { retrieveFirstToken } from 'auth/client/token';
// import { RootState } from "../store";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = retrieveFirstToken();
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
