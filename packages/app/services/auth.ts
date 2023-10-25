import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export interface User {
  first_name: string
  last_name: string
}

export interface UserResponse {
  user: User
  token: string
}

export interface LoginRequest {
  userId: string
  token: string
}

export const authApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost/api/v1/users',
    // prepareHeaders: (headers, { getState }) => {
    //   // By default, if we have a token in the store, let's use that for authenticated requests
    //   const token = (getState() as RootState).auth.token
    //   if (token) {
    //     headers.set('authorization', `Bearer ${token}`)
    //   }
    //   return headers
    // },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
    protected: builder.mutation<{ message: string }, void>({
      query: () => 'protected',
    }),
  }),
})

export const { useLoginMutation, useProtectedMutation } = authApi
