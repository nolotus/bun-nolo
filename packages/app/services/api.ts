import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { retrieveFirstToken } from 'auth/client/token';
// import { RootState } from "../store";

const getDynamicBaseUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? '/api/v1/'
    : 'http://localhost/api/v1/';
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: getDynamicBaseUrl(),
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
