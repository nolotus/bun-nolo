import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { retrieveFirstToken } from 'auth/client/token';
// import { RootState } from "../store";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = retrieveFirstToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
