import { api } from 'app/api';
import { API_VERSION } from 'database/config';
export interface User {
  first_name: string;
  last_name: string;
}

export interface UserResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  userId: string;
  token: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, LoginRequest>({
      query: (credentials) => ({
        url: `${API_VERSION}/users/login`,
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});
export const { useLoginMutation } = authApi;
